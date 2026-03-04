import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { Answer, CreateAnswerRequest, VoteType } from '../../models/answer.model';
import { CreateQuestionRequest, Question } from '../../models/question.model';
import { QuestionService } from '../../services/question.service';
import { AnswerService, AnswerVoteSummary } from '../../services/answer.service';
import { CommunityUserDirectoryService } from '../../services/community-user-directory.service';

interface AnswerView extends Answer {
  voteType?: VoteType | null;
  voteCount: number;
}

interface QuestionView extends Question {
  answers: AnswerView[];
  showAnswers: boolean;
}

@Component({
  selector: 'app-qa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './qa.component.html',
  styleUrls: ['./qa.component.css']
})
export class QaComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  showAskForm = false;
  questions: QuestionView[] = [];
  errorMessage = '';
  creatingQuestion = false;
  isLoadingPage = false;
  isLoadingMore = false;
  useInfiniteScroll = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  readonly pageSize = 5;
  sortOrder: 'ASC' | 'DESC' = 'DESC';
  searchTerm = '';
  popularityFilter: 'latest' | 'most-answered' = 'latest';

  private readonly answerControls = new Map<number, FormControl<string>>();
  private readonly loadingAnswers = new Set<number>();
  private readonly votingAnswers = new Set<number>();
  private readonly pageCache = new Map<number, QuestionView[]>();
  private readonly sourcePageCache = new Map<number, QuestionView[]>();
  private readonly questionPageIndex = new Map<number, number>();
  private readonly answerSearchIndex = new Map<number, string>();
  private readonly loadingAnswerSearchIndex = new Set<number>();
  private readonly stateStorageKey = 'community.qa.pagination.v1';
  private searchDebounceHandle: ReturnType<typeof setTimeout> | null = null;

  readonly questionForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(
    private readonly router: Router,
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
    private readonly userDirectory: CommunityUserDirectoryService
  ) {}

  ngOnInit(): void {
    this.restoreState();
    this.loadQuestions();
  }

  ngOnDestroy(): void {
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }

    this.persistState();
  }

  loadQuestions(page = this.currentPage, forceRefresh = false): void {
    const pageNumber = Math.max(1, Math.floor(page));
    const cached = this.pageCache.get(pageNumber);

    if (!forceRefresh && cached) {
      this.currentPage = pageNumber;
      this.rebuildVisibleQuestions();
      return;
    }

    if (this.useInfiniteScroll && pageNumber > 1) {
      this.isLoadingMore = true;
    } else {
      this.isLoadingPage = true;
    }

    this.questionService
      .getQuestionsPage(pageNumber, this.pageSize, {
        sortBy: 'createdAt',
        sortOrder: this.sortOrder,
        search: this.searchTerm
      })
      .subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.currentPage = Math.max(1, response.currentPage || pageNumber);
        this.totalPages = Math.max(1, response.totalPages || 1);
        this.totalItems = Math.max(0, response.totalItems);

        const mapped = this.sortQuestionsForDisplay(response.data.map((question) => this.mapQuestion(question)));
        this.sourcePageCache.set(pageNumber, mapped);

        mapped.forEach((question) => {
          this.questionPageIndex.set(question.id, pageNumber);
        });

        const { filteredCount, pageItems } = this.computePageItems(
          mapped,
          pageNumber,
          response.pageSize,
          response.currentPage
        );

        if (this.hasAdvancedFilter()) {
          this.totalItems = filteredCount;
          this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
        }

        this.hydrateQuestionAuthors(pageItems);
        this.pageCache.set(pageNumber, pageItems);
        this.rebuildVisibleQuestions();
        this.preloadAnswerSearchIndex(mapped);
        this.persistState();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
      complete: () => {
        this.isLoadingPage = false;
        this.isLoadingMore = false;
      }
    });
  }

  get pageNumbers(): number[] {
    const radius = 2;
    const start = Math.max(1, this.currentPage - radius);
    const end = Math.min(this.totalPages, this.currentPage + radius);
    const values: number[] = [];

    for (let page = start; page <= end; page += 1) {
      values.push(page);
    }

    return values;
  }

  get searchSuggestions(): string[] {
    const query = this.searchTerm.trim().toLowerCase();
    const suggestions = new Set<string>();

    this.pageCache.forEach((items) => {
      items.forEach((question) => {
        if (question.title?.trim()) {
          suggestions.add(question.title.trim());
        }

        if (question.description?.trim()) {
          suggestions.add(question.description.trim().slice(0, 80));
        }
      });
    });

    return Array.from(suggestions)
      .filter((item) => (query ? item.toLowerCase().includes(query) : true))
      .slice(0, 12);
  }

  goToPage(page: number): void {
    const target = Math.max(1, Math.min(this.totalPages, page));
    if (target === this.currentPage && !this.useInfiniteScroll) {
      return;
    }

    this.currentPage = target;
    this.persistState();
    this.loadQuestions(target);

    if (!this.useInfiniteScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  canLoadMore(): boolean {
    return this.useInfiniteScroll && this.currentPage < this.totalPages && !this.isLoadingMore;
  }

  loadMore(): void {
    if (this.canLoadMore()) {
      this.goToPage(this.currentPage + 1);
    }
  }

  toggleInfiniteScroll(): void {
    this.useInfiniteScroll = !this.useInfiniteScroll;

    if (!this.useInfiniteScroll) {
      this.rebuildVisibleQuestions();
    } else {
      this.currentPage = 1;
      this.pageCache.clear();
      this.loadQuestions(1, true);
    }

    this.persistState();
  }

  updateSort(value: string): void {
    this.sortOrder = value === 'ASC' ? 'ASC' : 'DESC';
    this.resetAndReload();
  }

  updateSearch(value: string): void {
    this.searchTerm = value;

    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }

    this.searchDebounceHandle = setTimeout(() => {
      this.resetAndReload();
    }, 250);
  }

  applySearchSuggestion(value: string): void {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    this.searchTerm = normalized;
    this.resetAndReload();
  }

  updatePopularityFilter(value: string): void {
    this.popularityFilter = value === 'most-answered' ? 'most-answered' : 'latest';
    this.resetAndReload();
  }

  clearAdvancedFilters(): void {
    this.popularityFilter = 'latest';
    this.resetAndReload();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.useInfiniteScroll || this.isLoadingMore || this.isLoadingPage || this.currentPage >= this.totalPages) {
      return;
    }

    const offset = 260;
    const position = window.scrollY + window.innerHeight;
    const threshold = document.documentElement.scrollHeight - offset;

    if (position >= threshold) {
      this.loadMore();
    }
  }

  openAskForm(): void {
    this.showAskForm = true;
  }

  submitQuestion(): void {
    if (this.questionForm.invalid || this.creatingQuestion) {
      this.questionForm.markAllAsTouched();
      return;
    }

    const raw = this.questionForm.getRawValue();
    const payload: CreateQuestionRequest = {
      title: raw.title.trim(),
      description: raw.description.trim()
    };

    this.creatingQuestion = true;
    this.questionService.createQuestion(payload).subscribe({
      next: (createdQuestion) => {
        this.errorMessage = '';
        const mapped = this.mapQuestion(createdQuestion);
        this.hydrateQuestionAuthors([mapped]);
        this.currentPage = 1;
        this.pageCache.clear();
        this.loadQuestions(1, true);
        this.cancelQuestion();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
      complete: () => {
        this.creatingQuestion = false;
      }
    });
  }

  cancelQuestion(): void {
    this.showAskForm = false;
    this.questionForm.reset({ title: '', description: '' });
    this.questionForm.markAsPristine();
    this.questionForm.markAsUntouched();
  }

  toggleAnswers(question: QuestionView): void {
    question.showAnswers = !question.showAnswers;

    if (question.showAnswers && question.answers.length === 0) {
      this.loadAnswers(question);
    }
  }

  isLoadingAnswers(questionId: number): boolean {
    return this.loadingAnswers.has(questionId);
  }

  isVoting(answerId: number): boolean {
    return this.votingAnswers.has(answerId);
  }

  getAnswerControl(questionId: number): FormControl<string> {
    const existing = this.answerControls.get(questionId);
    if (existing) {
      return existing;
    }

    const control = this.fb.nonNullable.control('', [Validators.required, Validators.minLength(5)]);
    this.answerControls.set(questionId, control);
    return control;
  }

  submitAnswer(question: QuestionView): void {
    const control = this.getAnswerControl(question.id);
    if (control.invalid) {
      control.markAsTouched();
      return;
    }

    const payload: CreateAnswerRequest = {
      content: control.value.trim(),
      question_id: question.id
    };

    this.answerService.addAnswer(payload).subscribe({
      next: (createdAnswer) => {
        this.errorMessage = '';
        const mapped = this.mapAnswer(createdAnswer);
        question.answers = [mapped, ...question.answers];
        question.answers_count = question.answers.length;
        this.answerSearchIndex.set(
          question.id,
          question.answers
            .map((answer) => answer.content || '')
            .join(' ')
            .toLowerCase()
        );
        this.hydrateAnswerAuthors(question.answers);
        this.refreshVoteSummary(mapped);
        if (this.popularityFilter === 'most-answered') {
          this.rebuildVisibleQuestions();
        }
        control.reset('');
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  voteAnswer(answer: AnswerView, voteType: VoteType): void {
    if (this.votingAnswers.has(answer.id)) {
      return;
    }

    const previousVote = this.currentVote(answer);
    const request$ =
      previousVote === voteType
        ? this.answerService.removeVote(answer.id)
        : previousVote
          ? this.answerService.removeVote(answer.id).pipe(switchMap(() => this.answerService.voteAnswer(answer.id, voteType)))
          : this.answerService.voteAnswer(answer.id, voteType);

    this.votingAnswers.add(answer.id);

    request$
      .pipe(finalize(() => this.votingAnswers.delete(answer.id)))
      .subscribe({
        next: () => this.refreshVoteSummary(answer),
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
  }

  currentVote(answer: AnswerView): VoteType | null {
    return answer.user_vote ?? answer.voteType ?? null;
  }

  questionAuthorName(question: QuestionView): string {
    return question.author_name || `User #${question.user_id}`;
  }

  answerAuthorName(answer: AnswerView): string {
    return answer.author_name || `User #${answer.user_id}`;
  }

  initials(name: string | undefined, fallbackId: number): string {
    const value = (name ?? '').trim();
    if (!value) {
      const cached = this.userDirectory.getCachedDisplay(fallbackId);
      return cached?.initials ?? `U${fallbackId}`;
    }

    const initials = value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    return initials || `U${fallbackId}`;
  }

  viewProfile(userId: number): void {
    this.router.navigate(['/community/profile', userId], {
      queryParams: { from: this.router.url }
    });
  }

  private mapQuestion(question: Question): QuestionView {
    const answers = Array.isArray(question.answers)
      ? question.answers.map((answer) => this.mapAnswer(answer))
      : [];

    return {
      ...question,
      answers,
      showAnswers: false
    };
  }

  private mapAnswer(answer: Answer): AnswerView {
    const upvotes = answer.upvotes ?? 0;
    const downvotes = answer.downvotes ?? 0;

    return {
      ...answer,
      upvotes,
      downvotes,
      voteType: answer.user_vote ?? null,
      voteCount: upvotes - downvotes
    };
  }

  private loadAnswers(question: QuestionView): void {
    this.loadingAnswers.add(question.id);

    this.answerService.getAnswersByQuestion(question.id).subscribe({
      next: (answers) => {
        question.answers = answers.map((answer) => this.mapAnswer(answer));
        question.answers_count = question.answers.length;
        this.answerSearchIndex.set(
          question.id,
          question.answers
            .map((answer) => answer.content || '')
            .join(' ')
            .toLowerCase()
        );
        this.hydrateAnswerAuthors(question.answers);
        question.answers.forEach((answer) => this.refreshVoteSummary(answer));
        if (this.popularityFilter === 'most-answered') {
          this.rebuildVisibleQuestions();
        }
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
      complete: () => {
        this.loadingAnswers.delete(question.id);
      }
    });
  }

  private refreshVoteSummary(answer: AnswerView): void {
    this.answerService.getAnswerVoteSummary(answer.id).subscribe({
      next: (summary) => this.applyVoteSummary(answer, summary),
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  private applyVoteSummary(answer: AnswerView, summary: AnswerVoteSummary): void {
    answer.upvotes = summary.upvotes;
    answer.downvotes = summary.downvotes;
    answer.voteCount = summary.voteCount;
    answer.user_vote = summary.userVote;
    answer.voteType = summary.userVote;
  }

  private hydrateQuestionAuthors(questions: QuestionView[]): void {
    const userIds = questions.map((question) => question.user_id);
    this.userDirectory.resolveUsers(userIds).subscribe({
      next: (users) => {
        questions.forEach((question) => {
          const match = users.get(question.user_id);
          if (match) {
            question.author_name = match.fullName;
          }
        });
      }
    });
  }

  private hydrateAnswerAuthors(answers: AnswerView[]): void {
    const userIds = answers.map((answer) => answer.user_id);
    this.userDirectory.resolveUsers(userIds).subscribe({
      next: (users) => {
        answers.forEach((answer) => {
          const match = users.get(answer.user_id);
          if (match) {
            answer.author_name = match.fullName;
          }
        });
      }
    });
  }

  private applyAdvancedFilters(questions: QuestionView[]): QuestionView[] {
    const query = this.searchTerm.trim().toLowerCase();

    return questions.filter((question) => {
      const title = (question.title || '').toLowerCase();
      const description = (question.description || '').toLowerCase();
      const loadedAnswersText = (question.answers || [])
        .map((answer) => answer.content || '')
        .join(' ')
        .toLowerCase();
      const indexedAnswersText = this.answerSearchIndex.get(question.id) || '';
      const answersText = `${loadedAnswersText} ${indexedAnswersText}`.trim();

      if (query) {
        const matches = title.includes(query) || description.includes(query) || answersText.includes(query);
        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }

  private sortQuestionsByPopularity(questions: QuestionView[]): QuestionView[] {
    if (this.popularityFilter !== 'most-answered') {
      return questions;
    }

    return [...questions].sort((left, right) => {
      const leftAnswers = left.answers_count ?? left.answers.length;
      const rightAnswers = right.answers_count ?? right.answers.length;

      if (leftAnswers === rightAnswers) {
        return this.createdAtTimestamp(right.created_at) - this.createdAtTimestamp(left.created_at);
      }

      return rightAnswers - leftAnswers;
    });
  }

  private hasAdvancedFilter(): boolean {
    return this.popularityFilter !== 'latest';
  }

  private rebuildVisibleQuestions(): void {
    if (!this.useInfiniteScroll) {
      this.questions = this.orderQuestionsForDisplay([...(this.pageCache.get(this.currentPage) ?? [])]);
      return;
    }

    const merged: QuestionView[] = [];
    for (let page = 1; page <= this.currentPage; page += 1) {
      const items = this.pageCache.get(page);
      if (items?.length) {
        merged.push(...items);
      }
    }

    this.questions = this.orderQuestionsForDisplay(merged);
  }

  private orderQuestionsForDisplay(questions: QuestionView[]): QuestionView[] {
    if (this.popularityFilter === 'most-answered') {
      return this.sortQuestionsByPopularity(questions);
    }

    return this.sortQuestionsForDisplay(questions);
  }

  private sortQuestionsForDisplay(questions: QuestionView[]): QuestionView[] {
    return [...questions].sort((left, right) => {
      const leftTimestamp = this.createdAtTimestamp(left.created_at);
      const rightTimestamp = this.createdAtTimestamp(right.created_at);

      if (leftTimestamp === rightTimestamp) {
        return left.id - right.id;
      }

      return this.sortOrder === 'ASC' ? leftTimestamp - rightTimestamp : rightTimestamp - leftTimestamp;
    });
  }

  private createdAtTimestamp(value: string): number {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private normalizePageItems(
    items: QuestionView[],
    requestedPage: number,
    serverPageSize: number,
    serverCurrentPage: number
  ): QuestionView[] {
    if (this.hasAdvancedFilter()) {
      if (this.useInfiniteScroll) {
        return items.slice(0, requestedPage * this.pageSize);
      }

      const strictStart = Math.max(0, (requestedPage - 1) * this.pageSize);
      return items.slice(strictStart, strictStart + this.pageSize);
    }

    if (items.length <= this.pageSize) {
      return items;
    }

    const normalizedServerSize =
      Number.isFinite(serverPageSize) && serverPageSize > 0 ? Math.floor(serverPageSize) : this.pageSize;
    const normalizedServerPage =
      Number.isFinite(serverCurrentPage) && serverCurrentPage > 0 ? Math.floor(serverCurrentPage) : requestedPage;

    if (normalizedServerPage === requestedPage && normalizedServerSize > this.pageSize) {
      return items.slice(0, this.pageSize);
    }

    const start = Math.max(0, (requestedPage - 1) * this.pageSize);
    if (start < items.length) {
      return items.slice(start, start + this.pageSize);
    }

    return items.slice(0, this.pageSize);
  }

  private computePageItems(
    source: QuestionView[],
    requestedPage: number,
    serverPageSize: number,
    serverCurrentPage: number
  ): { filteredCount: number; pageItems: QuestionView[] } {
    const filtered = this.applyAdvancedFilters(source);
    const ranked = this.sortQuestionsByPopularity(filtered);

    return {
      filteredCount: filtered.length,
      pageItems: this.normalizePageItems(ranked, requestedPage, serverPageSize, serverCurrentPage)
    };
  }

  private preloadAnswerSearchIndex(questions: QuestionView[]): void {
    const query = this.searchTerm.trim();
    if (!query) {
      return;
    }

    questions.forEach((question) => {
      if (this.answerSearchIndex.has(question.id) || this.loadingAnswerSearchIndex.has(question.id)) {
        return;
      }

      this.loadingAnswerSearchIndex.add(question.id);
      this.answerService.getAnswersByQuestion(question.id).subscribe({
        next: (answers) => {
          const indexedText = answers
            .map((answer) => answer.content || '')
            .join(' ')
            .toLowerCase();

          this.answerSearchIndex.set(question.id, indexedText);
          this.rebuildPageFromSource(question.id);
        },
        error: () => {
          this.loadingAnswerSearchIndex.delete(question.id);
        },
        complete: () => {
          this.loadingAnswerSearchIndex.delete(question.id);
        }
      });
    });
  }

  private rebuildPageFromSource(questionId: number): void {
    const pageNumber = this.questionPageIndex.get(questionId);
    if (!pageNumber) {
      return;
    }

    const source = this.sourcePageCache.get(pageNumber);
    if (!source) {
      return;
    }

    const { pageItems } = this.computePageItems(source, pageNumber, this.pageSize, pageNumber);
    this.pageCache.set(pageNumber, pageItems);
    this.rebuildVisibleQuestions();
  }

  private resetAndReload(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.pageCache.clear();
    this.sourcePageCache.clear();
    this.questionPageIndex.clear();
    this.loadQuestions(1, true);
    this.persistState();
  }

  private persistState(): void {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
      return;
    }

    sessionStorage.setItem(
      this.stateStorageKey,
      JSON.stringify({
        currentPage: this.currentPage,
        useInfiniteScroll: this.useInfiniteScroll,
        sortOrder: this.sortOrder,
        searchTerm: this.searchTerm,
        popularityFilter: this.popularityFilter,
        scrollY: window.scrollY
      })
    );
  }

  private restoreState(): void {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
      return;
    }

    const raw = sessionStorage.getItem(this.stateStorageKey);
    if (!raw) {
      return;
    }

    try {
      const state = JSON.parse(raw) as {
        currentPage?: number;
        useInfiniteScroll?: boolean;
        sortOrder?: 'ASC' | 'DESC';
        searchTerm?: string;
        popularityFilter?: 'latest' | 'most-answered';
        scrollY?: number;
      };

      if (Number.isFinite(state.currentPage) && (state.currentPage ?? 0) > 0) {
        this.currentPage = Math.floor(state.currentPage as number);
      }

      if (state.useInfiniteScroll === true || state.useInfiniteScroll === false) {
        this.useInfiniteScroll = state.useInfiniteScroll;
      }

      if (state.sortOrder === 'ASC' || state.sortOrder === 'DESC') {
        this.sortOrder = state.sortOrder;
      }

      if (typeof state.searchTerm === 'string') {
        this.searchTerm = state.searchTerm;
      }

      if (state.popularityFilter === 'latest' || state.popularityFilter === 'most-answered') {
        this.popularityFilter = state.popularityFilter;
      }

      if (Number.isFinite(state.scrollY)) {
        setTimeout(() => {
          window.scrollTo({ top: state.scrollY as number, behavior: 'auto' });
        }, 50);
      }
    } catch {
      // Ignore malformed pagination state
    }
  }
}
