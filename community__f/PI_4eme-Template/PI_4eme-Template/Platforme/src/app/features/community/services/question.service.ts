import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { CommunityBaseService, CommunityPage } from './community-base.service';
import { CreateQuestionRequest, Question, UpdateQuestionRequest } from '../models/question.model';

interface BackendQuestion {
  questionId: number;
  title: string;
  description: string;
  createdAt?: string;
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class QuestionService extends CommunityBaseService {
  constructor(private http: HttpClient) {
    super();
  }

  getQuestionsPage(
    page: number,
    size: number,
    options?: { sortBy?: string; sortOrder?: 'ASC' | 'DESC'; search?: string }
  ): Observable<CommunityPage<Question>> {
    const params = this.buildPageParams(page, size, options);

    return this.http
      .get<unknown>(`${this.communityBaseUrl}/questions`, {
        ...this.authOptions(),
        params
      })
      .pipe(
        map((response) => {
          const parsed = this.extractPage<BackendQuestion>(response, page, size);
          return {
            ...parsed,
            data: parsed.data.map((question) => this.mapQuestion(question))
          };
        }),
        catchError(this.handleError('Get questions page'))
      );
  }

  getQuestions(): Observable<Question[]> {
    return this.getQuestionsPage(1, 200).pipe(map((page) => page.data));
  }

  createQuestion(request: CreateQuestionRequest): Observable<Question> {
    return this.http
      .post<BackendQuestion | { question?: BackendQuestion; data?: BackendQuestion }>(
        `${this.communityBaseUrl}/questions`,
        request,
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapQuestion(this.extractEntity<BackendQuestion>(response, ['question', 'data']))),
        catchError(this.handleError('Create question'))
      );
  }

  updateQuestion(questionId: number, request: UpdateQuestionRequest): Observable<Question> {
    const payload = {
      title: request.title,
      description: request.description
    };

    return this.http
      .put<BackendQuestion | { question?: BackendQuestion; data?: BackendQuestion }>(
        `${this.communityBaseUrl}/questions/${questionId}`,
        payload,
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapQuestion(this.extractEntity<BackendQuestion>(response, ['question', 'data']))),
        catchError(this.handleError('Update question'))
      );
  }

  deleteQuestion(questionId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.communityBaseUrl}/questions/${questionId}`, this.authOptions())
      .pipe(catchError(this.handleError('Delete question')));
  }

  private mapQuestion(question: BackendQuestion): Question {
    return {
      id: question.questionId,
      title: question.title,
      description: question.description,
      user_id: question.userId,
      created_at: question.createdAt ?? ''
    };
  }

  private buildPageParams(
    page: number,
    size: number,
    options?: { sortBy?: string; sortOrder?: 'ASC' | 'DESC'; search?: string }
  ): HttpParams {
    let params = new HttpParams()
      .set('page', String(Math.max(1, Math.floor(page))))
      .set('size', String(Math.max(1, Math.floor(size))));

    if (options?.sortBy) {
      params = params.set('sortBy', options.sortBy);

      const normalizedOrder = (options.sortOrder ?? 'DESC').toLowerCase();
      params = params.set('sort', `${options.sortBy},${normalizedOrder}`);
    }

    if (options?.sortOrder) {
      params = params
        .set('sortOrder', options.sortOrder)
        .set('order', options.sortOrder)
        .set('direction', options.sortOrder);
    }

    if (options?.search && options.search.trim().length > 0) {
      params = params.set('search', options.search.trim());
    }

    return params;
  }
}
