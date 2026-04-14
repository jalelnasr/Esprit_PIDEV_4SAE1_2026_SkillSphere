import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { CommunityBaseService } from './community-base.service';
import { Comment, CreateCommentRequest } from '../models/comment.model';

interface BackendComment {
  commentId: number;
  content: string;
  createdAt?: string;
  userId: number;
  post?: { postId: number };
}

interface BackendCommentLike {
  commentLikeId: number;
  userId: number;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CommentService extends CommunityBaseService {
  constructor(private http: HttpClient) {
    super();
  }

  addComment(request: CreateCommentRequest): Observable<Comment> {
    return this.http
      .post<BackendComment | { comment?: BackendComment; data?: BackendComment }>(
        `${this.communityBaseUrl}/comments/${request.post_id}`,
        { content: request.content },
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapComment(this.extractEntity<BackendComment>(response, ['comment', 'data']), request.post_id)),
        catchError(this.handleError('Add comment'))
      );
  }

  getCommentsByPost(postId: number): Observable<Comment[]> {
    return this.http
      .get<BackendComment[] | { data?: BackendComment[]; items?: BackendComment[]; content?: BackendComment[] }>(
        `${this.communityBaseUrl}/comments/post/${postId}`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendComment>(response).map((comment) => this.mapComment(comment, postId))),
        catchError(this.handleError('Get comments by post'))
      );
  }

  likeComment(commentId: number): Observable<void> {
    return this.http
      .post<void>(`${this.communityBaseUrl}/comment-likes/${commentId}`, null, this.authOptions())
      .pipe(catchError(this.handleError('Like comment')));
  }

  unlikeComment(commentId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.communityBaseUrl}/comment-likes/${commentId}`, this.authOptions())
      .pipe(catchError(this.handleError('Unlike comment')));
  }

  getCommentLikeUserIds(commentId: number): Observable<number[]> {
    return this.http
      .get<BackendCommentLike[] | { data?: BackendCommentLike[]; items?: BackendCommentLike[]; content?: BackendCommentLike[] }>(
        `${this.communityBaseUrl}/comment-likes/comment/${commentId}`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendCommentLike>(response).map((like) => like.userId)),
        catchError(this.handleError('Get comment likes'))
      );
  }

  private mapComment(comment: BackendComment, fallbackPostId: number): Comment {
    return {
      id: comment.commentId,
      content: comment.content,
      post_id: comment.post?.postId ?? fallbackPostId,
      user_id: comment.userId,
      created_at: comment.createdAt ?? ''
    };
  }
}
