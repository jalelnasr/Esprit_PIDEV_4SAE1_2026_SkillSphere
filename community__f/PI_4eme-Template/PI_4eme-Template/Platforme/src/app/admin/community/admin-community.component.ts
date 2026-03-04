import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  Observable,
  Subscription,
  catchError,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  timer
} from 'rxjs';
import { AdminCommunityService } from './admin-community.service';
import { AdminActivityItem, AdminCommunityStats, AdminGroupSummary } from './admin-community.model';
import { QuestionService } from '../../features/community/services/question.service';
import { AnswerService } from '../../features/community/services/answer.service';
import { PostService } from '../../features/community/services/post.service';
import { Question } from '../../features/community/models/question.model';
import { Answer } from '../../features/community/models/answer.model';
import { Post } from '../../features/community/models/post.model';
import {
  CommunityUserDirectoryService,
  CommunityUserDisplay
} from '../../features/community/services/community-user-directory.service';

interface AdminActivityView extends AdminActivityItem {
  titleText: string;
  descriptionText: string;
  userName: string;
}

interface KpiCard {
  title: string;
  value: number;
  change: number | null;
  tone: 'ocean' | 'forest' | 'violet' | 'coral' | 'amber';
  caption: string;
}

interface LineChartSeriesVm {
  label: string;
  color: string;
  path: string;
  values: number[];
}

interface LineChartTickVm {
  value: number;
  y: number;
}

interface LineChartMarkerVm {
  label: string;
  x: number;
}

interface LineChartVm {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  yTicks: LineChartTickVm[];
  xMarkers: LineChartMarkerVm[];
  series: LineChartSeriesVm[];
}

interface WeeklyQaBarVm {
  label: string;
  questions: number;
  answers: number;
  questionsHeight: number;
  answersHeight: number;
}

interface GroupActivityBarVm {
  name: string;
  count: number;
  width: number;
}

@Component({
  selector: 'app-admin-community',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-community.component.html',
  styleUrls: ['./admin-community.component.css']
})
export class AdminCommunityComponent implements OnInit, OnDestroy {
  stats: AdminCommunityStats | null = null;
  recentActivities: AdminActivityView[] = [];

  kpiCards: KpiCard[] = [];
  activityChartVm: LineChartVm | null = null;
  activeUsersChartVm: LineChartVm | null = null;
  weeklyQuestionAnswerBars: WeeklyQaBarVm[] = [];
  topGroupBars: GroupActivityBarVm[] = [];
  insights: string[] = [];

  isLoading = true;
  errorMessage = '';

  private autoRefreshSub?: Subscription;
  private readonly refreshIntervalMs = 15000;
  private silentRefreshInFlight = false;

  private readonly exportableEventTypes = new Set([
    'POST_CREATED',
    'GROUP_CREATED',
    'ANSWER_CREATED',
    'QUESTION_CREATED',
    'COMMENT_CREATED'
  ]);

  readonly managementCards = [
    {
      title: 'Posts',
      description: 'Read-only moderation and post details',
      icon: 'file-text',
      route: '/admin/community/posts'
    },
    {
      title: 'Q&A',
      description: 'Browse questions and answers',
      icon: 'help-circle',
      route: '/admin/community/questions'
    },
    {
      title: 'Groups',
      description: 'Inspect groups and memberships',
      icon: 'users',
      route: '/admin/community/groups'
    },
    {
      title: 'Follows',
      description: 'Track social connection growth',
      icon: 'link-2',
      route: '/admin/community/follows'
    }
  ];

  constructor(
    private readonly adminCommunityService: AdminCommunityService,
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
    private readonly postService: PostService,
    private readonly userDirectory: CommunityUserDirectoryService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
  }

  loadData(silent = false): void {
    if (silent && this.silentRefreshInFlight) {
      return;
    }

    if (!silent) {
      this.isLoading = true;
      this.errorMessage = '';
    } else {
      this.silentRefreshInFlight = true;
    }

    forkJoin({
      stats: this.adminCommunityService.getStats(),
      activities: this.adminCommunityService.getRecentActivities(300).pipe(catchError(() => of([] as AdminActivityItem[]))),
      groups: this.adminCommunityService.getGroups().pipe(catchError(() => of([] as AdminGroupSummary[]))),
      posts: this.postService.getFeedPosts().pipe(catchError(() => of([] as Post[]))),
      questions: this.questionService.getQuestions().pipe(catchError(() => of([] as Question[])))
    })
      .pipe(
        switchMap((base) =>
          this.loadAnswersByQuestion(base.questions).pipe(
            map((answersByQuestion) => ({
              ...base,
              answersByQuestion
            }))
          )
        ),
        switchMap((base) =>
          this.enrichActivities(base.activities).pipe(
            map((enrichedActivities) => ({
              ...base,
              enrichedActivities
            }))
          )
        ),
        catchError((error: Error) => {
          this.errorMessage = error.message;
          return of(null);
        }),
        finalize(() => {
          if (!silent) {
            this.isLoading = false;
          }
          this.silentRefreshInFlight = false;
        })
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.stats = result.stats;
        this.recentActivities = result.enrichedActivities;

        const allAnswers = this.flattenAnswers(result.answersByQuestion);
        this.rebuildDashboard(result.stats, result.groups, result.posts, result.questions, allAnswers, result.answersByQuestion);
      });
  }

  exportActivitiesCsv(): void {
    const exportRows = this.getExportableActivities();
    const header = ['Type', 'Title', 'Description', 'UserId', 'EntityId', 'CreatedAt'];
    const rows = exportRows.map((activity) => [
      activity.type,
      activity.titleText,
      activity.descriptionText,
      activity.userId ?? '',
      activity.entityId ?? '',
      activity.createdAt
    ]);

    this.downloadFile('community-activities.csv', this.toCsv([header, ...rows]), 'text/csv;charset=utf-8;');
  }

  exportActivitiesExcel(): void {
    const exportRows = this.getExportableActivities();
    const htmlRows = exportRows
      .map(
        (activity) =>
          `<tr><td>${this.escape(activity.type)}</td><td>${this.escape(activity.titleText)}</td><td>${this.escape(activity.descriptionText)}</td><td>${activity.userId ?? ''}</td><td>${activity.entityId ?? ''}</td><td>${this.escape(activity.createdAt)}</td></tr>`
      )
      .join('');

    const content = `<table><thead><tr><th>Type</th><th>Title</th><th>Description</th><th>UserId</th><th>EntityId</th><th>CreatedAt</th></tr></thead><tbody>${htmlRows}</tbody></table>`;
    this.downloadFile('community-activities.xls', content, 'application/vnd.ms-excel');
  }

  private rebuildDashboard(
    stats: AdminCommunityStats,
    groups: AdminGroupSummary[],
    posts: Post[],
    questions: Question[],
    answers: Answer[],
    answersByQuestion: Map<number, Answer[]>
  ): void {
    const today = this.startOfDay(new Date());
    const currentStart = this.addDays(today, -29);
    const currentEnd = this.addDays(today, 1);
    const previousStart = this.addDays(currentStart, -30);
    const previousEnd = currentStart;

    const answersCurrent = this.countByDateRange(
      answers.map((answer) => answer.created_at),
      currentStart,
      currentEnd
    );
    const answersPrevious = this.countByDateRange(
      answers.map((answer) => answer.created_at),
      previousStart,
      previousEnd
    );
    const answersGrowth = this.calculateGrowth(answersCurrent, answersPrevious);

    this.kpiCards = [
      {
        title: 'Total Posts',
        value: stats.posts.current,
        change: stats.posts.growthPercent,
        tone: 'ocean',
        caption: 'Content production'
      },
      {
        title: 'Questions',
        value: stats.questions.current,
        change: stats.questions.growthPercent,
        tone: 'forest',
        caption: 'Knowledge demand'
      },
      {
        title: 'Answers',
        value: answersCurrent,
        change: answersGrowth,
        tone: 'violet',
        caption: 'Community support'
      },
      {
        title: 'Active Users',
        value: stats.activeUsers.current,
        change: stats.activeUsers.growthPercent,
        tone: 'coral',
        caption: 'Engagement'
      },
      {
        title: 'New Groups',
        value: stats.groups.current,
        change: stats.groups.growthPercent,
        tone: 'amber',
        caption: 'Community expansion'
      }
    ];

    const dayRange = this.getLastDays(30);
    const activityLabels = dayRange.map((date) => this.formatDayLabel(date));
    const dailyPostCounts = this.countByDay(posts.map((post) => post.created_at), dayRange);
    const dailyQuestionCounts = this.countByDay(questions.map((question) => question.created_at), dayRange);
    const dailyAnswerCounts = this.countByDay(answers.map((answer) => answer.created_at), dayRange);

    this.activityChartVm = this.buildLineChart(activityLabels, [
      { label: 'Posts', color: '#38bdf8', values: dailyPostCounts },
      { label: 'Questions', color: '#60a5fa', values: dailyQuestionCounts },
      { label: 'Answers', color: '#34d399', values: dailyAnswerCounts }
    ]);

    const weekRange = this.getLastWeeks(8);
    const weekLabels = weekRange.map((week) => this.formatWeekLabel(week));

    const activeUserEvents = [
      ...posts.map((post) => ({ userId: post.user_id, createdAt: post.created_at })),
      ...questions.map((question) => ({ userId: question.user_id, createdAt: question.created_at })),
      ...answers.map((answer) => ({ userId: answer.user_id, createdAt: answer.created_at })),
      ...groups.map((group) => ({ userId: group.createdBy, createdAt: group.createdAt }))
    ];

    const weeklyActiveUsers = this.countUniqueUsersByWeek(activeUserEvents, weekRange);
    this.activeUsersChartVm = this.buildLineChart(weekLabels, [
      { label: 'Active Users', color: '#f59e0b', values: weeklyActiveUsers }
    ]);

    const weeklyQuestionCounts = this.countByWeek(questions.map((question) => question.created_at), weekRange);
    const weeklyAnswerCounts = this.countByWeek(answers.map((answer) => answer.created_at), weekRange);
    const maxWeeklyCount = Math.max(1, ...weeklyQuestionCounts, ...weeklyAnswerCounts);

    this.weeklyQuestionAnswerBars = weekRange.map((week, index) => ({
      label: this.formatWeekLabel(week),
      questions: weeklyQuestionCounts[index],
      answers: weeklyAnswerCounts[index],
      questionsHeight: (weeklyQuestionCounts[index] / maxWeeklyCount) * 100,
      answersHeight: (weeklyAnswerCounts[index] / maxWeeklyCount) * 100
    }));

    const groupNames = new Map(groups.map((group) => [group.groupId, group.name]));
    const groupPostCounts = new Map<number, number>();
    posts.forEach((post) => {
      if (!Number.isFinite(post.group_id) || post.group_id === null) {
        return;
      }

      const groupId = Number(post.group_id);
      groupPostCounts.set(groupId, (groupPostCounts.get(groupId) ?? 0) + 1);
    });

    const sortedGroups = Array.from(groupPostCounts.entries())
      .map(([groupId, count]) => ({
        name: groupNames.get(groupId) ?? `Group #${groupId}`,
        count
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 5);

    const maxGroupCount = Math.max(1, ...sortedGroups.map((group) => group.count));
    this.topGroupBars = sortedGroups.map((group) => ({
      name: group.name,
      count: group.count,
      width: (group.count / maxGroupCount) * 100
    }));

    const unansweredQuestions = questions.filter((question) => (answersByQuestion.get(question.id)?.length ?? 0) === 0).length;
    const unansweredPercent = questions.length > 0 ? (unansweredQuestions / questions.length) * 100 : 0;

    const totalActivityCurrent = stats.posts.current + stats.questions.current + answersCurrent + stats.groups.current;
    const totalActivityPrevious = stats.posts.previous + stats.questions.previous + answersPrevious + stats.groups.previous;
    const activityGrowth = this.calculateGrowth(totalActivityCurrent, totalActivityPrevious);

    const latestActiveUsers = weeklyActiveUsers.length > 0 ? weeklyActiveUsers[weeklyActiveUsers.length - 1] : 0;
    const previousActiveUsers = weeklyActiveUsers.length > 1 ? weeklyActiveUsers[weeklyActiveUsers.length - 2] : 0;
    const engagementDelta = this.calculateGrowth(latestActiveUsers, previousActiveUsers);

    this.insights = [
      `Community activity ${activityGrowth >= 0 ? 'increased' : 'decreased'} by ${Math.abs(activityGrowth).toFixed(1)}% this month.`,
      `${unansweredPercent.toFixed(0)}% of questions remain unanswered.`,
      this.topGroupBars.length > 0
        ? `${this.topGroupBars[0].name} is the most active group.`
        : 'No group activity detected yet.',
      previousActiveUsers > 0
        ? `Engagement ${engagementDelta >= 0 ? 'improved' : 'dropped'} last week by ${Math.abs(engagementDelta).toFixed(1)}%.`
        : `Active users this week: ${latestActiveUsers}.`
    ];
  }

  private buildLineChart(
    labels: string[],
    series: Array<{ label: string; color: string; values: number[] }>
  ): LineChartVm | null {
    if (labels.length === 0 || series.length === 0) {
      return null;
    }

    const width = 760;
    const height = 280;
    const left = 46;
    const right = 14;
    const top = 16;
    const bottom = 34;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const rawMax = Math.max(1, ...series.flatMap((item) => item.values));
    const maxValue = this.niceMax(rawMax);

    const toPoint = (value: number, index: number): { x: number; y: number } => {
      const x = left + (labels.length === 1 ? plotWidth / 2 : (index / (labels.length - 1)) * plotWidth);
      const y = top + plotHeight - (value / maxValue) * plotHeight;
      return { x, y };
    };

    const mappedSeries: LineChartSeriesVm[] = series.map((item) => {
      const points = item.values.map((value, index) => toPoint(value, index));
      return {
        label: item.label,
        color: item.color,
        values: item.values,
        path: this.buildLinePath(points)
      };
    });

    const tickCount = 5;
    const yTicks: LineChartTickVm[] = Array.from({ length: tickCount }, (_, index) => {
      const ratio = index / (tickCount - 1);
      const value = maxValue - ratio * maxValue;
      return {
        value: Math.round(value * 10) / 10,
        y: top + ratio * plotHeight
      };
    });

    const markerIndexes = this.buildMarkerIndexes(labels.length, labels.length > 12 ? 6 : labels.length);
    const xMarkers: LineChartMarkerVm[] = markerIndexes.map((index) => ({
      label: labels[index],
      x: left + (labels.length === 1 ? plotWidth / 2 : (index / (labels.length - 1)) * plotWidth)
    }));

    return {
      width,
      height,
      left,
      right,
      top,
      bottom,
      yTicks,
      xMarkers,
      series: mappedSeries
    };
  }

  private buildLinePath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) {
      return '';
    }

    if (points.length === 1) {
      const point = points[0];
      return `M ${point.x.toFixed(2)} ${point.y.toFixed(2)} L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    }

    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');
  }

  private buildMarkerIndexes(length: number, target: number): number[] {
    if (length <= 1) {
      return [0];
    }

    const markers = Math.max(2, Math.min(target, length));
    const indexes = new Set<number>();
    for (let index = 0; index < markers; index += 1) {
      indexes.add(Math.round((index * (length - 1)) / (markers - 1)));
    }

    return Array.from(indexes).sort((left, right) => left - right);
  }

  private niceMax(value: number): number {
    if (value <= 1) {
      return 1;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));
    const normalized = value / magnitude;
    const rounded = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return rounded * magnitude;
  }

  private loadAnswersByQuestion(questions: Question[]): Observable<Map<number, Answer[]>> {
    if (questions.length === 0) {
      return of(new Map<number, Answer[]>());
    }

    const requests = questions.map((question) =>
      this.answerService.getAnswersByQuestion(question.id).pipe(catchError(() => of([] as Answer[])))
    );

    return forkJoin(requests).pipe(
      map((responses) => {
        const byQuestion = new Map<number, Answer[]>();
        questions.forEach((question, index) => {
          byQuestion.set(question.id, responses[index]);
        });
        return byQuestion;
      })
    );
  }

  private flattenAnswers(byQuestion: Map<number, Answer[]>): Answer[] {
    const flattened: Answer[] = [];
    byQuestion.forEach((answers) => flattened.push(...answers));
    return flattened;
  }

  private getLastDays(days: number): Date[] {
    const today = this.startOfDay(new Date());
    return Array.from({ length: days }, (_, index) => this.addDays(today, index - (days - 1)));
  }

  private getLastWeeks(weeks: number): Date[] {
    const currentWeekStart = this.startOfWeek(new Date());
    return Array.from({ length: weeks }, (_, index) => this.addDays(currentWeekStart, (index - (weeks - 1)) * 7));
  }

  private countByDay(values: string[], days: Date[]): number[] {
    const counts = new Map<string, number>();
    values.forEach((value) => {
      const parsed = this.parseDate(value);
      if (!parsed) {
        return;
      }
      const key = this.dateKey(this.startOfDay(parsed));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return days.map((day) => counts.get(this.dateKey(day)) ?? 0);
  }

  private countByWeek(values: string[], weeks: Date[]): number[] {
    const counts = new Map<string, number>();
    values.forEach((value) => {
      const parsed = this.parseDate(value);
      if (!parsed) {
        return;
      }
      const key = this.dateKey(this.startOfWeek(parsed));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return weeks.map((week) => counts.get(this.dateKey(week)) ?? 0);
  }

  private countUniqueUsersByWeek(
    events: Array<{ userId: number; createdAt: string }>,
    weeks: Date[]
  ): number[] {
    const byWeek = new Map<string, Set<number>>();

    events.forEach((event) => {
      if (!Number.isFinite(event.userId) || event.userId <= 0) {
        return;
      }

      const parsed = this.parseDate(event.createdAt);
      if (!parsed) {
        return;
      }

      const key = this.dateKey(this.startOfWeek(parsed));
      if (!byWeek.has(key)) {
        byWeek.set(key, new Set<number>());
      }

      byWeek.get(key)?.add(event.userId);
    });

    return weeks.map((week) => byWeek.get(this.dateKey(week))?.size ?? 0);
  }

  private countByDateRange(values: string[], start: Date, end: Date): number {
    return values.reduce((count, value) => {
      const parsed = this.parseDate(value);
      if (!parsed) {
        return count;
      }

      return parsed >= start && parsed < end ? count + 1 : count;
    }, 0);
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous <= 0) {
      return current > 0 ? 100 : 0;
    }

    return ((current - previous) / previous) * 100;
  }

  private parseDate(value: string): Date | null {
    if (!value || value.trim().length === 0) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  private startOfWeek(date: Date): Date {
    const copy = this.startOfDay(date);
    const dayIndex = copy.getDay();
    const diffToMonday = (dayIndex + 6) % 7;
    copy.setDate(copy.getDate() - diffToMonday);
    return copy;
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private formatDayLabel(date: Date): string {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }

  private formatWeekLabel(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
  }

  private toCsv(rows: Array<Array<string | number>>): string {
    return rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  private downloadFile(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private startAutoRefresh(): void {
    this.autoRefreshSub = timer(this.refreshIntervalMs, this.refreshIntervalMs).subscribe(() => {
      this.loadData(true);
    });
  }

  private getExportableActivities(): AdminActivityView[] {
    return this.recentActivities.filter((activity) =>
      this.exportableEventTypes.has(String(activity.type || '').toUpperCase())
    );
  }

  private enrichActivities(activities: AdminActivityItem[]): Observable<AdminActivityView[]> {
    const ids = new Set<number>();

    activities.forEach((activity) => {
      if (activity.userId !== null && Number.isFinite(activity.userId)) {
        ids.add(activity.userId);
      }

      this.extractMentionedUserIds(activity.title).forEach((id) => ids.add(id));
      this.extractMentionedUserIds(activity.description).forEach((id) => ids.add(id));
    });

    if (ids.size === 0) {
      return of(this.mapActivities(activities, new Map<number, CommunityUserDisplay>()));
    }

    return this.userDirectory.resolveUsers(Array.from(ids)).pipe(
      map((users) => this.mapActivities(activities, users)),
      catchError(() => of(this.mapActivities(activities, new Map<number, CommunityUserDisplay>())))
    );
  }

  private mapActivities(
    activities: AdminActivityItem[],
    users: Map<number, CommunityUserDisplay>
  ): AdminActivityView[] {
    return activities.map((activity) => {
      const titleText = this.replaceMentions(activity.title, users);
      const descriptionText = this.replaceMentions(activity.description, users);
      const userName =
        activity.userId !== null
          ? (users.get(activity.userId)?.fullName ?? `User #${activity.userId}`)
          : 'System';

      return {
        ...activity,
        titleText,
        descriptionText,
        userName
      };
    });
  }

  private extractMentionedUserIds(text: string): number[] {
    if (!text) {
      return [];
    }

    const matches = text.matchAll(/user\s*#\s*(\d+)/gi);
    const ids: number[] = [];
    for (const match of matches) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed)) {
        ids.push(parsed);
      }
    }

    return ids;
  }

  private replaceMentions(text: string, users: Map<number, CommunityUserDisplay>): string {
    if (!text) {
      return text;
    }

    return text.replace(/user\s*#\s*(\d+)/gi, (fullMatch, idValue: string) => {
      const id = Number(idValue);
      if (!Number.isFinite(id)) {
        return fullMatch;
      }

      return users.get(id)?.fullName ?? `User #${id}`;
    });
  }
}
