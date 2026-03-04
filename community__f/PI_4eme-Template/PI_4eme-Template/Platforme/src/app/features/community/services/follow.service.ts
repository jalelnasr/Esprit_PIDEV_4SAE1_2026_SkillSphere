import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { CommunityBaseService } from './community-base.service';

interface BackendFollow {
  followId: number;
  followerId: number;
  followingId: number;
  createdAt?: string;
}

export interface FollowRelationship {
  followId: number;
  followerId: number;
  followingId: number;
}

interface FollowStatusResponse {
  isFollowing: boolean;
}

@Injectable({ providedIn: 'root' })
export class FollowService extends CommunityBaseService {
  constructor(private http: HttpClient) {
    super();
  }

  followUser(followingId: number): Observable<void> {
    return this.http
      .post<void>(`${this.communityBaseUrl}/users/${followingId}/follow`, null, this.authOptions())
      .pipe(catchError(this.handleError('Follow user')));
  }

  unfollowUser(followingId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.communityBaseUrl}/users/${followingId}/unfollow`, this.authOptions())
      .pipe(catchError(this.handleError('Unfollow user')));
  }

  getFollowStatus(userId: number): Observable<boolean> {
    return this.http
      .get<boolean | FollowStatusResponse | { data?: FollowStatusResponse }>(
        `${this.communityBaseUrl}/users/${userId}/follow-status`,
        this.authOptions()
      )
      .pipe(
        map((response) => {
          if (typeof response === 'boolean') {
            return response;
          }
          const payload = this.extractEntity<FollowStatusResponse>(response, ['data']);
          return Boolean(payload?.isFollowing);
        }),
        catchError(this.handleError('Check follow status'))
      );
  }

  getFollowers(userId: number): Observable<FollowRelationship[]> {
    return this.http
      .get<BackendFollow[] | { data?: BackendFollow[]; items?: BackendFollow[]; content?: BackendFollow[] }>(
        `${this.communityBaseUrl}/follows/followers/${userId}`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendFollow>(response).map((follow) => this.mapFollow(follow))),
        catchError(this.handleError('Get followers'))
      );
  }

  getFollowing(userId: number): Observable<FollowRelationship[]> {
    return this.http
      .get<BackendFollow[] | { data?: BackendFollow[]; items?: BackendFollow[]; content?: BackendFollow[] }>(
        `${this.communityBaseUrl}/follows/following/${userId}`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendFollow>(response).map((follow) => this.mapFollow(follow))),
        catchError(this.handleError('Get following'))
      );
  }

  countFollowers(userId: number): Observable<number> {
    return this.http
      .get<number>(`${this.communityBaseUrl}/follows/followers/${userId}/count`, this.authOptions())
      .pipe(catchError(this.handleError('Count followers')));
  }

  countFollowing(userId: number): Observable<number> {
    return this.http
      .get<number>(`${this.communityBaseUrl}/follows/following/${userId}/count`, this.authOptions())
      .pipe(catchError(this.handleError('Count following')));
  }

  getCurrentUserIdSafe(): number | null {
    try {
      return this.currentUserId();
    } catch {
      return null;
    }
  }

  private mapFollow(follow: BackendFollow): FollowRelationship {
    return {
      followId: follow.followId,
      followerId: follow.followerId,
      followingId: follow.followingId
    };
  }
}
