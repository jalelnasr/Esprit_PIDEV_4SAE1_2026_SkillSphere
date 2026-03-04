import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminActivityItem,
  AdminFollowSummary,
  AdminCommunityStats,
  AdminGroupSummary,
  AdminPostDetail,
  AdminPostListResponse,
  AdminQuestionStatus,
  AdminQuestionSummary
} from './admin-community.model';

@Injectable({ providedIn: 'root' })
export class AdminCommunityService {
  private readonly baseUrl = this.buildBaseUrl();
  private readonly communityBaseUrl = this.buildCommunityBaseUrl();

  constructor(private readonly http: HttpClient) {}

  getStats(): Observable<AdminCommunityStats> {
    return this.http
      .get<AdminCommunityStats>(`${this.baseUrl}/stats`)
      .pipe(catchError(this.handleError('Load community stats')));
  }

  getRecentActivities(limit = 20): Observable<AdminActivityItem[]> {
    return this.http
      .get<AdminActivityItem[]>(`${this.baseUrl}/recent-activities`, {
        params: { limit }
      })
      .pipe(catchError(this.handleError('Load recent activities')));
  }

  getPosts(page = 0, size = 20): Observable<AdminPostListResponse> {
    return this.http
      .get<AdminPostListResponse>(`${this.baseUrl}/posts`, {
        params: { page, size }
      })
      .pipe(catchError(this.handleError('Load admin posts')));
  }

  getPostDetail(postId: number): Observable<AdminPostDetail> {
    return this.http
      .get<AdminPostDetail>(`${this.baseUrl}/posts/${postId}`)
      .pipe(catchError(this.handleError('Load post details')));
  }

  getQuestions(): Observable<AdminQuestionSummary[]> {
    return this.http
      .get<unknown>(`${this.communityBaseUrl}/questions`)
      .pipe(
        map((response) => this.extractList<Record<string, unknown>>(response).map((item) => this.mapQuestion(item))),
        catchError(this.handleError('Load questions'))
      );
  }

  getGroups(): Observable<AdminGroupSummary[]> {
    return this.http
      .get<unknown>(`${this.communityBaseUrl}/groups`)
      .pipe(
        map((response) => this.extractList<Record<string, unknown>>(response).map((item) => this.mapGroup(item))),
        catchError(this.handleError('Load groups'))
      );
  }

  getGroupMembersCount(groupId: number): Observable<number> {
    return this.http
      .get<unknown>(`${this.communityBaseUrl}/group-members/group/${groupId}`)
      .pipe(
        map((response) => this.extractList<unknown>(response).length),
        catchError(() => of(0))
      );
  }

  getAllFollows(userIds: number[]): Observable<AdminFollowSummary[]> {
    const ids = Array.from(new Set(userIds.filter((id) => Number.isFinite(id) && id > 0)));
    if (ids.length === 0) {
      return of([]);
    }

    return forkJoin(
      ids.map((id) =>
        this.http.get<unknown>(`${this.communityBaseUrl}/follows/following/${id}`).pipe(
          map((response) => this.extractList<Record<string, unknown>>(response).map((item) => this.mapFollow(item))),
          catchError(() => of([] as AdminFollowSummary[]))
        )
      )
    ).pipe(
      map((chunks) => chunks.flat()),
      map((follows) => this.deduplicateFollows(follows))
    );
  }

  private buildBaseUrl(): string {
    const configuredCommunityApiUrl = (environment as Record<string, unknown>)['communityApiUrl'];
    const rawBase =
      typeof configuredCommunityApiUrl === 'string' && configuredCommunityApiUrl.trim().length > 0
        ? configuredCommunityApiUrl
        : environment.apiUrl;
    const base = rawBase.replace(/\/+$/, '');

    if (base.endsWith('/api/community')) {
      return `${base}/admin/community`;
    }

    if (base.endsWith('/api')) {
      return `${base}/community/admin/community`;
    }

    return `${base}/api/community/admin/community`;
  }

  private buildCommunityBaseUrl(): string {
    const configuredCommunityApiUrl = (environment as Record<string, unknown>)['communityApiUrl'];
    const rawBase =
      typeof configuredCommunityApiUrl === 'string' && configuredCommunityApiUrl.trim().length > 0
        ? configuredCommunityApiUrl
        : environment.apiUrl;
    const base = rawBase.replace(/\/+$/, '');

    if (base.endsWith('/api/community')) {
      return base;
    }

    if (base.endsWith('/api')) {
      return `${base}/community`;
    }

    return `${base}/api/community`;
  }

  private extractList<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (response && typeof response === 'object') {
      const record = response as Record<string, unknown>;
      const data = record['data'];
      const items = record['items'];
      const content = record['content'];

      if (Array.isArray(data)) {
        return data as T[];
      }

      if (Array.isArray(items)) {
        return items as T[];
      }

      if (Array.isArray(content)) {
        return content as T[];
      }
    }

    return [];
  }

  private mapQuestion(raw: Record<string, unknown>): AdminQuestionSummary {
    const questionId = this.asNumber(raw['questionId'] ?? raw['id'] ?? raw['question_id']) ?? 0;
    const title = String(raw['title'] ?? '').trim();
    const description = String(raw['description'] ?? raw['content'] ?? '').trim();
    const createdAt = String(raw['createdAt'] ?? raw['created_at'] ?? raw['created'] ?? '').trim();
    const userId = this.asNumber(raw['userId'] ?? raw['user_id'] ?? raw['authorId'] ?? raw['createdBy']) ?? 0;
    const status = this.normalizeQuestionStatus(raw);

    return {
      questionId,
      title,
      description,
      createdAt,
      userId,
      status
    };
  }

  private mapGroup(raw: Record<string, unknown>): AdminGroupSummary {
    const groupId = this.asNumber(raw['groupId'] ?? raw['id'] ?? raw['group_id']) ?? 0;
    const name = String(raw['name'] ?? '').trim();
    const description = String(raw['description'] ?? '').trim();
    const createdAt = String(raw['createdAt'] ?? raw['created_at'] ?? raw['created'] ?? '').trim();
    const createdBy = this.asNumber(raw['createdBy'] ?? raw['created_by'] ?? raw['createdById'] ?? raw['userId']) ?? 0;
    const membersCount = this.extractMembersCount(raw);

    return {
      groupId,
      name,
      description,
      createdAt,
      createdBy,
      membersCount
    };
  }

  private mapFollow(raw: Record<string, unknown>): AdminFollowSummary {
    const followId = this.asNumber(raw['followId'] ?? raw['follow_id'] ?? raw['id']) ?? 0;
    const followerId = this.asNumber(raw['followerId'] ?? raw['follower_id']) ?? 0;
    const followingId = this.asNumber(raw['followingId'] ?? raw['following_id']) ?? 0;
    const createdAt = String(raw['createdAt'] ?? raw['created_at'] ?? raw['created'] ?? '').trim();

    return {
      followId,
      followerId,
      followingId,
      createdAt
    };
  }

  private deduplicateFollows(follows: AdminFollowSummary[]): AdminFollowSummary[] {
    const byKey = new Map<string, AdminFollowSummary>();

    follows.forEach((follow) => {
      const key = follow.followId > 0 ? `id:${follow.followId}` : `pair:${follow.followerId}:${follow.followingId}`;
      if (!byKey.has(key)) {
        byKey.set(key, follow);
      }
    });

    return Array.from(byKey.values()).sort((a, b) => {
      const left = Date.parse(a.createdAt || '');
      const right = Date.parse(b.createdAt || '');
      return (Number.isFinite(right) ? right : 0) - (Number.isFinite(left) ? left : 0);
    });
  }

  private extractMembersCount(raw: Record<string, unknown>): number {
    const directCount =
      this.asNumber(raw['membersCount'] ?? raw['members_count'] ?? raw['memberCount'] ?? raw['member_count']) ??
      null;

    if (directCount !== null) {
      return directCount;
    }

    const listCandidates = [raw['members'], raw['groupMembers'], raw['memberships'], raw['group_members']];
    for (const candidate of listCandidates) {
      if (Array.isArray(candidate)) {
        return candidate.length;
      }
    }

    for (const [key, value] of Object.entries(raw)) {
      const normalizedKey = key.toLowerCase();
      if (!normalizedKey.includes('member')) {
        continue;
      }

      const parsed = this.asNumber(value);
      if (parsed !== null) {
        return parsed;
      }

      if (Array.isArray(value)) {
        return value.length;
      }
    }

    return 0;
  }

  private normalizeQuestionStatus(raw: Record<string, unknown>): AdminQuestionStatus {
    const statusValue = String(raw['status'] ?? raw['state'] ?? '').trim().toLowerCase();
    if (statusValue === 'closed' || statusValue === 'close') {
      return 'closed';
    }
    if (statusValue === 'open') {
      return 'open';
    }

    const closedFlag = raw['isClosed'] ?? raw['closed'] ?? raw['is_closed'];
    if (typeof closedFlag === 'boolean') {
      return closedFlag ? 'closed' : 'open';
    }

    const openFlag = raw['isOpen'] ?? raw['open'] ?? raw['is_open'];
    if (typeof openFlag === 'boolean') {
      return openFlag ? 'open' : 'closed';
    }

    return 'open';
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      const backendMessage =
        typeof error.error === 'string'
          ? error.error
          : (error.error as { message?: string } | null)?.message;

      return throwError(() => new Error(backendMessage || `${operation} failed`));
    };
  }
}
