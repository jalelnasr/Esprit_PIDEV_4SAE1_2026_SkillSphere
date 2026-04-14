import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { CommunityBaseService, CommunityPage } from './community-base.service';
import { CreatePostRequest, Post, UpdatePostRequest } from '../models/post.model';

interface BackendPost {
  postId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt?: string;
  userId: number;
  groupId?: number | null;
}

interface BackendPostLike {
  postLikeId: number;
  userId: number;
  createdAt?: string;
  post?: { postId: number };
}

@Injectable({ providedIn: 'root' })
export class PostService extends CommunityBaseService {
  constructor(private http: HttpClient) {
    super();
  }

  createPost(request: CreatePostRequest): Observable<Post> {
    const payload = {
      content: request.content,
      imageUrl: request.image_url ?? null,
      videoUrl: request.video_url ?? null
    };

    const endpoint =
      request.group_id === null
        ? `${this.communityBaseUrl}/posts`
        : `${this.communityBaseUrl}/posts/group/${request.group_id}`;

    return this.http
      .post<BackendPost | { post?: BackendPost; data?: BackendPost }>(
        endpoint,
        payload,
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapPost(this.extractEntity<BackendPost>(response, ['post', 'data']))),
        catchError(this.handleError('Create post'))
      );
  }

  getFeedPostsPage(
    page: number,
    size: number,
    options?: { sortBy?: string; sortOrder?: 'ASC' | 'DESC'; search?: string }
  ): Observable<CommunityPage<Post>> {
    const params = this.buildPageParams(page, size, options);

    return this.http
      .get<unknown>(`${this.communityBaseUrl}/posts`, {
        ...this.authOptions(),
        params
      })
      .pipe(
        map((response) => {
          const parsed = this.extractPage<BackendPost>(response, page, size);
          return {
            ...parsed,
            data: parsed.data.map((post) => this.mapPost(post))
          };
        }),
        catchError(this.handleError('Get feed posts page'))
      );
  }

  getFeedPosts(): Observable<Post[]> {
    return this.getFeedPostsPage(1, 200).pipe(map((page) => page.data));
  }

  getPostsByGroup(groupId: number): Observable<Post[]> {
    return this.http
      .get<BackendPost[] | { data?: BackendPost[]; items?: BackendPost[]; content?: BackendPost[] }>(
        `${this.communityBaseUrl}/posts/group/${groupId}`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendPost>(response).map((post) => this.mapPost(post))),
        catchError(this.handleError('Get group posts'))
      );
  }

  getPostsByUser(userId: number): Observable<Post[]> {
    return this.http
      .get<BackendPost[] | { data?: BackendPost[]; items?: BackendPost[]; content?: BackendPost[] }>(
        `${this.communityBaseUrl}/posts/user/${userId}`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendPost>(response).map((post) => this.mapPost(post))),
        catchError(this.handleError('Get user posts'))
      );
  }

  updatePost(postId: number, request: UpdatePostRequest): Observable<Post> {
    const payload = {
      content: request.content,
      imageUrl: request.image_url ?? null,
      videoUrl: request.video_url ?? null,
      groupId: request.group_id ?? null
    };

    return this.http
      .put<BackendPost | { post?: BackendPost; data?: BackendPost }>(
        `${this.communityBaseUrl}/posts/${postId}`,
        payload,
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapPost(this.extractEntity<BackendPost>(response, ['post', 'data']))),
        catchError(this.handleError('Update post'))
      );
  }

  deletePost(postId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.communityBaseUrl}/posts/${postId}`, this.authOptions())
      .pipe(catchError(this.handleError('Delete post')));
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

  likePost(postId: number): Observable<void> {
    return this.http
      .post<void>(`${this.communityBaseUrl}/post-likes/${postId}`, null, this.authOptions())
      .pipe(catchError(this.handleError('Like post')));
  }

  unlikePost(postId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.communityBaseUrl}/post-likes/${postId}`, this.authOptions())
      .pipe(catchError(this.handleError('Unlike post')));
  }

  getPostLikeUserIds(postId: number): Observable<number[]> {
    return this.http
      .get<BackendPostLike[] | { data?: BackendPostLike[]; items?: BackendPostLike[]; content?: BackendPostLike[] }>(
        `${this.communityBaseUrl}/post-likes/post/${postId}`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendPostLike>(response).map((like) => like.userId)),
        catchError(this.handleError('Get post likes'))
      );
  }

  private mapPost(post: BackendPost): Post {
    return {
      id: post.postId,
      content: post.content,
      image_url: this.sanitizeMediaUrl(post.imageUrl),
      video_url: this.sanitizeMediaUrl(post.videoUrl),
      user_id: post.userId,
      group_id: post.groupId ?? null,
      created_at: post.createdAt ?? ''
    };
  }

  private sanitizeMediaUrl(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    if (!normalized || normalized.startsWith('blob:')) {
      return null;
    }

    return normalized;
  }
}
