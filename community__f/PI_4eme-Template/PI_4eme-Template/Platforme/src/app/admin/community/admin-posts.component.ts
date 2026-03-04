import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, catchError, finalize, forkJoin, map, of, switchMap, timer } from 'rxjs';
import { AdminCommunityService } from './admin-community.service';
import {
  AdminGroupSummary,
  AdminPostComment,
  AdminPostDetail,
  AdminPostLike,
  AdminPostSummary
} from './admin-community.model';
import {
  CommunityUserDirectoryService,
  CommunityUserDisplay
} from '../../features/community/services/community-user-directory.service';

interface AdminPostSummaryView extends AdminPostSummary {
  authorName: string;
  authorInitials: string;
  groupName: string | null;
}

interface AdminPostLikeView extends AdminPostLike {
  userName: string;
  userInitials: string;
}

interface AdminPostCommentView extends AdminPostComment {
  userName: string;
  userInitials: string;
}

interface AdminPostDetailView {
  post: AdminPostSummaryView;
  likes: AdminPostLikeView[];
  comments: AdminPostCommentView[];
}

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-posts.component.html',
  styleUrls: ['./admin-posts.component.css']
})
export class AdminPostsComponent implements OnInit, OnDestroy {
  posts: AdminPostSummaryView[] = [];
  selectedPostDetail: AdminPostDetailView | null = null;

  isLoading = true;
  isLoadingDetail = false;
  errorMessage = '';
  detailErrorMessage = '';

  page = 0;
  size = 20;
  total = 0;
  searchTerm = '';

  private groupNamesById = new Map<number, string>();
  private autoRefreshSub?: Subscription;
  private readonly refreshIntervalMs = 15000;
  private silentRefreshInFlight = false;

  constructor(
    private readonly adminCommunityService: AdminCommunityService,
    private readonly userDirectory: CommunityUserDirectoryService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
  }

  loadPosts(silent = false): void {
    if (silent && this.silentRefreshInFlight) {
      return;
    }

    if (!silent) {
      this.isLoading = true;
      this.errorMessage = '';
    } else {
      this.silentRefreshInFlight = true;
    }

    const selectedPostId = this.selectedPostDetail?.post.postId ?? null;

    forkJoin({
      response: this.adminCommunityService.getPosts(this.page, this.size),
      groups: this.adminCommunityService.getGroups().pipe(catchError(() => of<AdminGroupSummary[]>([])))
    })
      .pipe(
        switchMap(({ response, groups }) => {
          this.total = response.total;
          if (groups.length > 0) {
            this.groupNamesById = new Map(groups.map((group) => [group.groupId, group.name]));
          }

          return this.userDirectory.resolveUsers(response.posts.map((post) => post.userId)).pipe(
            map((users) => response.posts.map((post) => this.mapPostSummary(post, users))),
            catchError(() => of(response.posts.map((post) => this.mapPostSummary(post, new Map()))))
          );
        }),
        catchError((error: Error) => {
          this.errorMessage = error.message;
          return of([] as AdminPostSummaryView[]);
        }),
        finalize(() => {
          if (!silent) {
            this.isLoading = false;
          }
          this.silentRefreshInFlight = false;
        })
      )
      .subscribe((posts) => {
        this.posts = posts;

        if (selectedPostId !== null && !posts.some((post) => post.postId === selectedPostId)) {
          this.closeDetail();
        }
      });
  }

  selectPost(post: AdminPostSummaryView): void {
    this.isLoadingDetail = true;
    this.detailErrorMessage = '';
    this.selectedPostDetail = null;

    this.adminCommunityService
      .getPostDetail(post.postId)
      .pipe(
        switchMap((detail) => {
          if (detail.post.groupId !== null && !this.groupNamesById.has(detail.post.groupId)) {
            return this.adminCommunityService.getGroups().pipe(
              map((groups) => {
                groups.forEach((group) => this.groupNamesById.set(group.groupId, group.name));
                return detail;
              }),
              catchError(() => of(detail))
            );
          }

          return of(detail);
        }),
        switchMap((detail) => {
          const userIds = [
            detail.post.userId,
            ...detail.likes.map((like) => like.userId),
            ...detail.comments.map((comment) => comment.userId)
          ];

          return this.userDirectory.resolveUsers(userIds).pipe(
            map((users) => this.mapPostDetail(detail, users)),
            catchError(() => of(this.mapPostDetail(detail, new Map())))
          );
        }),
        catchError((error: Error) => {
          this.detailErrorMessage = error.message;
          return of<AdminPostDetailView | null>(null);
        }),
        finalize(() => {
          this.isLoadingDetail = false;
        })
      )
      .subscribe((detail) => {
        if (detail) {
          this.selectedPostDetail = detail;
        }
      });
  }

  closeDetail(): void {
    this.selectedPostDetail = null;
    this.detailErrorMessage = '';
  }

  get visiblePosts(): AdminPostSummaryView[] {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return this.posts;
    }

    return this.posts.filter(
      (post) =>
        post.content.toLowerCase().includes(normalizedTerm) ||
        String(post.postId).includes(normalizedTerm) ||
        String(post.userId).includes(normalizedTerm) ||
        post.authorName.toLowerCase().includes(normalizedTerm) ||
        (post.groupName ?? '').toLowerCase().includes(normalizedTerm)
    );
  }

  get selectedPostLikes(): AdminPostLikeView[] {
    return this.selectedPostDetail?.likes ?? [];
  }

  get selectedPostComments(): AdminPostCommentView[] {
    return this.selectedPostDetail?.comments ?? [];
  }

  previousPage(): void {
    if (this.page === 0) {
      return;
    }

    this.page -= 1;
    this.loadPosts();
    this.closeDetail();
  }

  nextPage(): void {
    if ((this.page + 1) * this.size >= this.total) {
      return;
    }

    this.page += 1;
    this.loadPosts();
    this.closeDetail();
  }

  private startAutoRefresh(): void {
    this.autoRefreshSub = timer(this.refreshIntervalMs, this.refreshIntervalMs).subscribe(() => {
      this.loadPosts(true);
    });
  }

  private mapPostSummary(
    post: AdminPostSummary,
    users: Map<number, CommunityUserDisplay>
  ): AdminPostSummaryView {
    const authorDisplay = users.get(post.userId);
    const authorName = authorDisplay?.fullName ?? `User #${post.userId}`;

    return {
      ...post,
      authorName,
      authorInitials: authorDisplay?.initials ?? this.initials(authorName, post.userId),
      groupName: post.groupId === null ? null : this.groupNamesById.get(post.groupId) ?? `Group #${post.groupId}`
    };
  }

  private mapPostDetail(
    detail: AdminPostDetail,
    users: Map<number, CommunityUserDisplay>
  ): AdminPostDetailView {
    const likes: AdminPostLikeView[] = detail.likes.map((like) => {
      const display = users.get(like.userId);
      const userName = display?.fullName ?? `User #${like.userId}`;

      return {
        ...like,
        userName,
        userInitials: display?.initials ?? this.initials(userName, like.userId)
      };
    });

    const comments: AdminPostCommentView[] = detail.comments.map((comment) => {
      const display = users.get(comment.userId);
      const userName = display?.fullName ?? `User #${comment.userId}`;

      return {
        ...comment,
        userName,
        userInitials: display?.initials ?? this.initials(userName, comment.userId)
      };
    });

    return {
      post: this.mapPostSummary(detail.post, users),
      likes,
      comments
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
