import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { CommunityBaseService } from './community-base.service';
import { Answer, CreateAnswerRequest, GitHubRepoPreview, UpdateAnswerRequest, VoteType } from '../models/answer.model';

interface BackendGitHubRepoPreview {
  repoName?: string;
  owner?: string;
  description?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  url?: string;
  status?: string;
  message?: string;
}

interface BackendAnswer {
  answerId: number;
  content: string;
  createdAt?: string;
  userId: number;
  questionId?: number;
  question?: { questionId: number };
  githubPreviews?: BackendGitHubRepoPreview[];
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
    return this.http
      .post<BackendAnswer | { answer?: BackendAnswer; data?: BackendAnswer }>(
        `${this.communityBaseUrl}/answers/${request.question_id}`,
        { content: request.content },
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapAnswer(this.extractEntity<BackendAnswer>(response, ['answer', 'data']), request.question_id)),
        catchError(this.handleError('Add answer'))
      );
  }

  updateAnswer(answerId: number, request: UpdateAnswerRequest, questionId: number): Observable<Answer> {
    const payload = {
      content: request.content
    };

    return this.http
      .put<BackendAnswer | { answer?: BackendAnswer; data?: BackendAnswer }>(
        `${this.communityBaseUrl}/answers/${answerId}`,
        payload,
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapAnswer(this.extractEntity<BackendAnswer>(response, ['answer', 'data']), questionId)),
        catchError(this.handleError('Update answer'))
      );
  }

  deleteAnswer(answerId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.communityBaseUrl}/answers/${answerId}`, this.authOptions())
      .pipe(catchError(this.handleError('Delete answer')));
  }

  previewGitHub(content: string): Observable<GitHubRepoPreview | null> {
    const normalized = content.trim();
    if (!normalized) {
      return of(null);
    }

    const params = new HttpParams().set('content', normalized);

    return this.http
      .get<BackendGitHubRepoPreview>(`${this.communityBaseUrl}/answers/github-preview`, {
        ...this.authOptions(),
        params
      })
      .pipe(
        map((response) => this.mapGitHubPreview(response)),
        catchError(this.handleError('Preview GitHub repository'))
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
    const params = new HttpParams().set('voteType', voteType);

    return this.http
      .post<void>(`${this.communityBaseUrl}/answer-votes/${answerId}`, null, {
        ...this.authOptions(),
        params
      })
      .pipe(catchError(this.handleError('Vote answer')));
  }

  removeVote(answerId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.communityBaseUrl}/answer-votes/${answerId}`, this.authOptions())
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
      question_id: answer.questionId ?? answer.question?.questionId ?? fallbackQuestionId,
      user_id: answer.userId,
      created_at: answer.createdAt ?? '',
      github_previews: Array.isArray(answer.githubPreviews)
        ? answer.githubPreviews
            .map((preview) => this.mapGitHubPreview(preview))
            .filter((preview): preview is GitHubRepoPreview => preview !== null)
        : []
    };
  }

  private mapGitHubPreview(preview: BackendGitHubRepoPreview | null | undefined): GitHubRepoPreview | null {
    if (!preview) {
      return null;
    }

    const normalizedStatus = String(preview.status ?? 'OK').toUpperCase();
    const status: GitHubRepoPreview['status'] =
      normalizedStatus === 'INVALID_URL' ||
      normalizedStatus === 'NOT_FOUND' ||
      normalizedStatus === 'RATE_LIMITED' ||
      normalizedStatus === 'ERROR'
        ? normalizedStatus
        : 'OK';

    return {
      repo_name: String(preview.repoName ?? '').trim(),
      owner: String(preview.owner ?? '').trim(),
      description: String(preview.description ?? '').trim(),
      language: String(preview.language ?? 'Unknown').trim() || 'Unknown',
      stars: Number(preview.stars ?? 0),
      forks: Number(preview.forks ?? 0),
      url: String(preview.url ?? '').trim(),
      status,
      message: typeof preview.message === 'string' ? preview.message.trim() : undefined
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
