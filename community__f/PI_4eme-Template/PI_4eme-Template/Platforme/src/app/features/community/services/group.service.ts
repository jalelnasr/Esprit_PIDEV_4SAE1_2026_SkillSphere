import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { CommunityBaseService, CommunityPage } from './community-base.service';
import { CreateGroupRequest, Group } from '../models/group.model';
import { Post } from '../models/post.model';

interface BackendGroup {
  groupId: number;
  name: string;
  description: string;
  createdBy: number;
  createdAt?: string;
}

interface BackendPost {
  postId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt?: string;
  userId: number;
  groupId?: number | null;
}

interface GroupJoinResponse {
  groupId: number;
  userId: number;
  joined: boolean;
  role?: string;
  joinedAt?: string;
  message?: string;
}

interface GroupMembershipResponse {
  groupId: number;
  joined: boolean;
  role?: string | null;
}

interface GroupMembershipsResponse {
  memberships: GroupMembershipRecord[];
}

export interface GroupMembershipRecord {
  groupId: number;
  role: string;
  joinedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class GroupService extends CommunityBaseService {
  constructor(private http: HttpClient) {
    super();
  }

  getGroupsPage(
    page: number,
    size: number,
    options?: { sortBy?: string; sortOrder?: 'ASC' | 'DESC'; search?: string }
  ): Observable<CommunityPage<Group>> {
    const params = this.buildPageParams(page, size, options);

    return this.http
      .get<unknown>(`${this.communityBaseUrl}/groups`, {
        ...this.authOptions(),
        params
      })
      .pipe(
        map((response) => {
          const parsed = this.extractPage<BackendGroup>(response, page, size);
          return {
            ...parsed,
            data: parsed.data.map((group) => this.mapGroup(group))
          };
        }),
        catchError(this.handleError('Get groups page'))
      );
  }

  getGroups(): Observable<Group[]> {
    return this.getGroupsPage(1, 200).pipe(map((page) => page.data));
  }

  createGroup(request: CreateGroupRequest): Observable<Group> {
    return this.http
      .post<BackendGroup | { group?: BackendGroup; data?: BackendGroup }>(
        `${this.communityBaseUrl}/groups`,
        request,
        this.authOptions()
      )
      .pipe(
        map((response) => this.mapGroup(this.extractEntity<BackendGroup>(response, ['group', 'data']))),
        catchError(this.handleError('Create group'))
      );
  }

  joinGroup(groupId: number): Observable<GroupJoinResponse> {
    return this.http
      .post<GroupJoinResponse | { data?: GroupJoinResponse; join?: GroupJoinResponse }>(
        `${this.communityBaseUrl}/groups/${groupId}/join`,
        null,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractEntity<GroupJoinResponse>(response, ['data', 'join'])),
        catchError(this.handleError('Join group'))
      );
  }

  getGroupMembership(groupId: number): Observable<boolean> {
    return this.http
      .get<GroupMembershipResponse | { data?: GroupMembershipResponse }>(
        `${this.communityBaseUrl}/groups/${groupId}/membership`,
        this.authOptions()
      )
      .pipe(
        map((response) => {
          const payload = this.extractEntity<GroupMembershipResponse>(response, ['data']);
          return Boolean(payload?.joined);
        }),
        catchError(this.handleError('Check group membership'))
      );
  }

  leaveGroup(groupId: number): Observable<GroupJoinResponse> {
    let userId: number | null = null;
    try {
      userId = this.currentUserId();
    } catch {
      userId = null;
    }

    const requests = this.buildLeaveRequests(groupId, userId);

    return this.requestLeaveWithFallback(requests).pipe(
      map((response) => this.normalizeLeaveResponse(response, groupId, userId)),
      catchError(this.handleError('Leave group'))
    );
  }

  getMemberships(): Observable<GroupMembershipRecord[]> {
    return this.http
      .get<GroupMembershipsResponse | GroupMembershipRecord[] | { data?: GroupMembershipsResponse; memberships?: GroupMembershipRecord[] }>(
        `${this.communityBaseUrl}/groups/memberships`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.parseMembershipsResponse(response)),
        catchError(this.handleError('Get memberships'))
      );
  }

  getGroupPosts(groupId: number): Observable<Post[]> {
    return this.http
      .get<BackendPost[] | { data?: BackendPost[]; items?: BackendPost[]; content?: BackendPost[] }>(
        `${this.communityBaseUrl}/groups/${groupId}/posts`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendPost>(response).map((post) => this.mapPost(post))),
        catchError(this.handleError('Get group posts'))
      );
  }

  private mapGroup(group: BackendGroup): Group {
    return {
      id: group.groupId,
      name: group.name,
      description: group.description,
      created_by: group.createdBy,
      created_at: group.createdAt ?? ''
    };
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

  private parseMembershipsResponse(
    response:
      | GroupMembershipsResponse
      | GroupMembershipRecord[]
      | { data?: GroupMembershipsResponse; memberships?: GroupMembershipRecord[] }
  ): GroupMembershipRecord[] {
    if (Array.isArray(response)) {
      return response.filter((value): value is GroupMembershipRecord => Number.isFinite(value.groupId));
    }

    if (Array.isArray(response.memberships)) {
      return response.memberships.filter((value): value is GroupMembershipRecord => Number.isFinite(value.groupId));
    }

    const payload = this.extractEntity<GroupMembershipsResponse>(response, ['data']);
    if (payload && Array.isArray(payload.memberships)) {
      return payload.memberships.filter((value): value is GroupMembershipRecord => Number.isFinite(value.groupId));
    }

    return [];
  }

  private buildLeaveRequests(groupId: number, userId: number | null): Array<() => Observable<unknown>> {
    const requests: Array<() => Observable<unknown>> = [
      () =>
        this.http.delete<unknown>(
          `${this.communityBaseUrl}/groups/${groupId}/leave`,
          this.authOptions()
        ),
      () =>
        this.http.post<unknown>(
          `${this.communityBaseUrl}/groups/${groupId}/leave`,
          null,
          this.authOptions()
        )
    ];

    if (userId !== null) {
      requests.push(
        () =>
          this.http.delete<unknown>(
            `${this.communityBaseUrl}/groups/${groupId}/leave/${userId}`,
            this.authOptions()
          ),
        () =>
          this.http.post<unknown>(
            `${this.communityBaseUrl}/groups/${groupId}/leave/${userId}`,
            null,
            this.authOptions()
          ),
        () =>
          this.http.delete<unknown>(
            `${this.communityBaseUrl}/groups/${groupId}/members/${userId}`,
            this.authOptions()
          ),
        () =>
          this.http.post<unknown>(
            `${this.communityBaseUrl}/groups/${groupId}/leave`,
            { userId },
            this.authOptions()
          )
      );
    }

    return requests;
  }

  private requestLeaveWithFallback(
    requests: Array<() => Observable<unknown>>,
    index = 0
  ): Observable<unknown> {
    return requests[index]().pipe(
      catchError((error: HttpErrorResponse) => {
        const canTryNext = index + 1 < requests.length;
        if (canTryNext && this.shouldRetryLeaveRequest(error)) {
          return this.requestLeaveWithFallback(requests, index + 1);
        }

        return throwError(() => error);
      })
    );
  }

  private shouldRetryLeaveRequest(error: HttpErrorResponse): boolean {
    return error.status === 400 || error.status === 404 || error.status === 405 || error.status === 415;
  }

  private normalizeLeaveResponse(response: unknown, groupId: number, userId: number | null): GroupJoinResponse {
    const payload = this.extractEntity<Record<string, unknown>>(response, ['data', 'leave', 'membership']);

    const parsedGroupId = this.tryParseNumber(payload?.['groupId']);
    const parsedUserId = this.tryParseNumber(payload?.['userId']);

    return {
      groupId: parsedGroupId ?? groupId,
      userId: parsedUserId ?? userId ?? 0,
      joined: payload?.['joined'] === true,
      role: typeof payload?.['role'] === 'string' ? payload['role'] : undefined,
      joinedAt: typeof payload?.['joinedAt'] === 'string' ? payload['joinedAt'] : undefined,
      message: typeof payload?.['message'] === 'string' ? payload['message'] : undefined
    };
  }

  private tryParseNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
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
