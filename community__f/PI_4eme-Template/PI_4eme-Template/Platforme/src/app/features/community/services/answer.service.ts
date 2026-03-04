import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { CommunityBaseService } from './community-base.service';
import { Answer, CreateAnswerRequest, VoteType } from '../models/answer.model';

interface BackendAnswer {
  answerId: number;
  content: string;
  createdAt?: string;
  userId: number;
  question?: { questionId: number };
}

interface BackendAnswerVote {
  answerVoteId: number;
  voteType: string;
  userId: number;
  createdAt?: string;
}

export interface AnswerVoteSummary {
  upvotes: number;
  downvotes: number;
  voteCount: number;
  userVote: VoteType | null;
}

@Injectable({ providedIn: 'root' })
export class AnswerService extends CommunityBaseService {
  constructor(private http: HttpClient) {
    super();
  }

  addAnswer(request: CreateAnswerRequest): Observable<Answer> {
    const userId = this.currentUserId();

    return this.http
      .post<BackendAnswer | { answer?: BackendAnswer; data?: BackendAnswer }>(
        `${this.communityBaseUrl}/answers/${userId}/${request.question_id}`,
        { content: request.content },
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapAnswer(this.extractEntity<BackendAnswer>(response, ['answer', 'data']), request.question_id)),
        catchError(this.handleError('Add answer'))
      );
  }

  getAnswersByQuestion(questionId: number): Observable<Answer[]> {
    return this.http
      .get<BackendAnswer[] | { data?: BackendAnswer[]; items?: BackendAnswer[]; content?: BackendAnswer[] }>(
        `${this.communityBaseUrl}/answers/question/${questionId}`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendAnswer>(response).map((answer) => this.mapAnswer(answer, questionId))),
        catchError(this.handleError('Get answers by question'))
      );
  }

  voteAnswer(answerId: number, voteType: VoteType): Observable<void> {
    const userId = this.currentUserId();
    const params = new HttpParams().set('voteType', voteType);

    return this.http
      .post<void>(`${this.communityBaseUrl}/answer-votes/${userId}/${answerId}`, null, {
        ...this.authOptions(),
        params
      })
      .pipe(catchError(this.handleError('Vote answer')));
  }

  removeVote(answerId: number): Observable<void> {
    const userId = this.currentUserId();

    return this.http
      .delete<void>(`${this.communityBaseUrl}/answer-votes/${userId}/${answerId}`, this.authOptions())
      .pipe(catchError(this.handleError('Remove answer vote')));
  }

  getAnswerVoteSummary(answerId: number): Observable<AnswerVoteSummary> {
    const currentUserId = this.currentUserId();

    return this.http
      .get<BackendAnswerVote[] | { data?: BackendAnswerVote[]; items?: BackendAnswerVote[]; content?: BackendAnswerVote[] }>(
        `${this.communityBaseUrl}/answer-votes/answer/${answerId}`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.toVoteSummary(this.extractList<BackendAnswerVote>(response), currentUserId)),
        catchError(this.handleError('Get answer votes'))
      );
  }

  private mapAnswer(answer: BackendAnswer, fallbackQuestionId: number): Answer {
    return {
      id: answer.answerId,
      content: answer.content,
      question_id: answer.question?.questionId ?? fallbackQuestionId,
      user_id: answer.userId,
      created_at: answer.createdAt ?? ''
    };
  }

  private toVoteSummary(votes: BackendAnswerVote[], currentUserId: number): AnswerVoteSummary {
    let upvotes = 0;
    let downvotes = 0;
    let userVote: VoteType | null = null;

    votes.forEach((vote) => {
      const normalized = String(vote.voteType || '').toUpperCase();
      if (normalized === 'UP') {
        upvotes += 1;
      }

      if (normalized === 'DOWN') {
        downvotes += 1;
      }

      if (vote.userId === currentUserId && (normalized === 'UP' || normalized === 'DOWN')) {
        userVote = normalized as VoteType;
      }
    });

    return {
      upvotes,
      downvotes,
      voteCount: upvotes - downvotes,
      userVote
    };
  }
}
