import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, catchError, finalize, map, of, switchMap, timer } from 'rxjs';
import { AdminQuestionStatus, AdminQuestionSummary } from './admin-community.model';
import { AdminCommunityService } from './admin-community.service';
import {
  CommunityUserDirectoryService,
  CommunityUserDisplay
} from '../../features/community/services/community-user-directory.service';
import { Answer } from '../../features/community/models/answer.model';
import { AnswerService } from '../../features/community/services/answer.service';

interface AdminQuestionView extends AdminQuestionSummary {
  authorName: string;
  authorInitials: string;
}

interface AdminAnswerView extends Answer {
  authorName: string;
  authorInitials: string;
}

@Component({
  selector: 'app-admin-questions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-questions.component.html',
  styleUrls: ['./admin-questions.component.css']
})
export class AdminQuestionsComponent implements OnInit, OnDestroy {
  questions: AdminQuestionView[] = [];
  selectedQuestion: AdminQuestionView | null = null;

  filterStatus: 'all' | AdminQuestionStatus = 'all';
  isLoading = true;
  errorMessage = '';
  isLoadingAnswers = false;
  answersErrorMessage = '';
  questionAnswers: AdminAnswerView[] = [];

  private autoRefreshSub?: Subscription;
  private readonly refreshIntervalMs = 15000;
  private silentRefreshInFlight = false;

  constructor(
    private readonly adminCommunityService: AdminCommunityService,
    private readonly userDirectory: CommunityUserDirectoryService,
    private readonly answerService: AnswerService
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
  }

  loadQuestions(silent = false): void {
    if (silent && this.silentRefreshInFlight) {
      return;
    }

    if (!silent) {
      this.isLoading = true;
      this.errorMessage = '';
    } else {
      this.silentRefreshInFlight = true;
    }

    const selectedQuestionId = this.selectedQuestion?.questionId ?? null;

    this.adminCommunityService
      .getQuestions()
      .pipe(
        switchMap((questions) =>
          this.userDirectory.resolveUsers(questions.map((question) => question.userId)).pipe(
            map((users) =>
              questions.map((question) => {
                const display = users.get(question.userId);
                const authorName = display?.fullName ?? `User #${question.userId}`;

                return {
                  ...question,
                  authorName,
                  authorInitials: display?.initials ?? this.initials(authorName, question.userId)
                };
              })
            )
          )
        ),
        catchError((error: Error) => {
          this.errorMessage = error.message;
          return of([] as AdminQuestionView[]);
        }),
        finalize(() => {
          if (!silent) {
            this.isLoading = false;
          }
          this.silentRefreshInFlight = false;
        })
      )
      .subscribe((questions) => {
        this.questions = questions;

        if (selectedQuestionId === null) {
          return;
        }

        const matched = questions.find((question) => question.questionId === selectedQuestionId);
        if (!matched) {
          this.closeDetail();
          return;
        }

        this.selectedQuestion = matched;
        this.loadQuestionAnswers(matched.questionId, true);
      });
  }

  selectQuestion(question: AdminQuestionView): void {
    this.selectedQuestion = question;
    this.loadQuestionAnswers(question.questionId);
  }

  closeDetail(): void {
    this.selectedQuestion = null;
    this.questionAnswers = [];
    this.answersErrorMessage = '';
  }

  getFilteredQuestions(): AdminQuestionView[] {
    if (this.filterStatus === 'all') {
      return this.questions;
    }

    return this.questions.filter((question) => question.status === this.filterStatus);
  }

  private loadQuestionAnswers(questionId: number, silent = false): void {
    if (!silent) {
      this.isLoadingAnswers = true;
      this.answersErrorMessage = '';
      this.questionAnswers = [];
    }

    this.answerService
      .getAnswersByQuestion(questionId)
      .pipe(
        switchMap((answers) =>
          this.userDirectory.resolveUsers(answers.map((answer) => answer.user_id)).pipe(
            map((users) => answers.map((answer) => this.mapAnswer(answer, users)))
          )
        ),
        catchError((error: Error) => {
          if (!silent) {
            this.answersErrorMessage = error.message;
            return of([] as AdminAnswerView[]);
          }

          return of(this.questionAnswers);
        }),
        finalize(() => {
          if (!silent) {
            this.isLoadingAnswers = false;
          }
        })
      )
      .subscribe((answers) => {
        this.questionAnswers = answers;
      });
  }

  private startAutoRefresh(): void {
    this.autoRefreshSub = timer(this.refreshIntervalMs, this.refreshIntervalMs).subscribe(() => {
      this.loadQuestions(true);
    });
  }

  private mapAnswer(answer: Answer, users: Map<number, CommunityUserDisplay>): AdminAnswerView {
    const display = users.get(answer.user_id);
    const authorName = display?.fullName ?? `User #${answer.user_id}`;

    return {
      ...answer,
      authorName,
      authorInitials: display?.initials ?? this.initials(authorName, answer.user_id)
    };
  }

  private initials(name: string, fallbackId: number): string {
    const value = (name ?? '').trim();
    if (!value) {
      return `U${fallbackId}`;
    }

    const initials = value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    return initials || `U${fallbackId}`;
  }
}
