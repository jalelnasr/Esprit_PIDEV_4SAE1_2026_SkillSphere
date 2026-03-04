import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  Subscription,
  catchError,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  of,
  switchMap
} from 'rxjs';
import { ToastService } from '@core/services';
import { FollowService } from '../../services/follow.service';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { CommunityProfileUserService } from '../../services/community-profile-user.service';
import { Comment } from '../../models/comment.model';
import { Post } from '../../models/post.model';

interface UserPost {
  id: number;
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  user_id: number;
  created_at: string;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
}

interface UserProfile {
  id: number;
  name: string;
  avatar: string;
  bio: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  isFollowing: boolean;
  posts: UserPost[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  isFollowingInFlight = false;
  followErrorMessage = '';
  profileErrorMessage = '';
  loadingProfile = true;

  readonly currentUserId: number | null;
  private routeSubscription: Subscription | null = null;
  private querySubscription: Subscription | null = null;
  private backTargetUrl = '/community/feed';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly followService: FollowService,
    private readonly toast: ToastService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly profileUserService: CommunityProfileUserService
  ) {
    this.currentUserId = this.followService.getCurrentUserIdSafe();
  }

  ngOnInit(): void {
    this.querySubscription = this.route.queryParamMap.subscribe((params) => {
      const from = params.get('from');
      this.backTargetUrl = this.isAllowedBackRoute(from) ? from : '/community/feed';
    });

    this.routeSubscription = this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        distinctUntilChanged(),
        switchMap((userId) => {
          this.loadingProfile = true;
          this.profileErrorMessage = '';
          this.followErrorMessage = '';
          this.user = null;

          if (!Number.isFinite(userId) || userId <= 0) {
            this.profileErrorMessage = 'Invalid user id.';
            return of(null).pipe(finalize(() => (this.loadingProfile = false)));
          }

          return this.loadUserProfile(userId).pipe(
            catchError((error: Error) => {
              this.profileErrorMessage = error.message;
              return of(null);
            }),
            finalize(() => (this.loadingProfile = false))
          );
        })
      )
      .subscribe((profile) => {
        this.user = profile;
      });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.querySubscription?.unsubscribe();
  }

  goBack(): void {
    this.router.navigateByUrl(this.backTargetUrl);
  }

  toggleFollow(): void {
    if (!this.user || this.isFollowingInFlight) {
      return;
    }

    if (this.currentUserId === null) {
      this.toast.warning('Please log in to follow users');
      return;
    }

    const targetUserId = this.user.id;
    const previousIsFollowing = this.user.isFollowing;
    const previousFollowersCount = this.user.followers_count;

    this.followErrorMessage = '';
    this.user.isFollowing = !previousIsFollowing;
    this.user.followers_count = Math.max(0, previousFollowersCount + (previousIsFollowing ? -1 : 1));

    this.isFollowingInFlight = true;
    const request$ = previousIsFollowing
      ? this.followService.unfollowUser(targetUserId)
      : this.followService.followUser(targetUserId);

    request$
      .pipe(finalize(() => (this.isFollowingInFlight = false)))
      .subscribe({
        next: () => {
          this.followErrorMessage = '';
          this.toast.success(previousIsFollowing ? 'Unfollowed user' : 'Started following user');
        },
        error: (error: Error) => {
          const normalizedMessage = (error.message || '').toLowerCase();

          // Backend can respond with 400 "Already following" / "Already unfollowed".
          if (!previousIsFollowing && normalizedMessage.includes('already') && normalizedMessage.includes('follow')) {
            if (this.user) {
              this.user.isFollowing = true;
              this.user.followers_count = previousFollowersCount;
            }
            this.followErrorMessage = '';
            this.toast.info('Already following');
            return;
          }

          if (
            previousIsFollowing &&
            ((normalizedMessage.includes('already') && normalizedMessage.includes('unfollow')) ||
              (normalizedMessage.includes('not') && normalizedMessage.includes('follow')))
          ) {
            if (this.user) {
              this.user.isFollowing = false;
              this.user.followers_count = previousFollowersCount;
            }
            this.followErrorMessage = '';
            this.toast.info('Already unfollowed');
            return;
          }

          this.followErrorMessage = error.message;
          if (this.user) {
            this.user.isFollowing = previousIsFollowing;
            this.user.followers_count = previousFollowersCount;
          }
          this.toast.error(error.message || (previousIsFollowing ? 'Failed to unfollow user' : 'Failed to follow user'));
        }
      });
  }

  togglePostLike(post: UserPost): void {
    const request$ = post.likedByCurrentUser
      ? this.postService.unlikePost(post.id)
      : this.postService.likePost(post.id);

    request$.subscribe({
      next: () => {
        this.postService
          .getPostLikeUserIds(post.id)
          .pipe(catchError(() => of<number[]>([])))
          .subscribe((likeUserIds) => {
            post.likesCount = likeUserIds.length;
            post.likedByCurrentUser = this.currentUserId !== null && likeUserIds.includes(this.currentUserId);
          });
      },
      error: (error: Error) => {
        this.profileErrorMessage = error.message;
      }
    });
  }

  sendMessage(): void {
    if (!this.user) {
      return;
    }

    this.router.navigate(['/community/messages', this.user.id]);
  }

  private loadUserProfile(userId: number): Observable<UserProfile> {
    return forkJoin({
      user: this.profileUserService.getUserById(userId),
      posts: this.postService.getPostsByUser(userId).pipe(catchError(() => of<Post[]>([]))),
      followersCount: this.followService.countFollowers(userId).pipe(catchError(() => of(0))),
      followingCount: this.followService.countFollowing(userId).pipe(catchError(() => of(0))),
      followStatus:
        this.currentUserId === null || this.currentUserId === userId
          ? of(false)
          : this.followService.getFollowStatus(userId).pipe(catchError(() => of(false)))
    }).pipe(
      switchMap((baseData) =>
        this.enrichPosts(baseData.posts).pipe(
          map((posts) => ({
            user: baseData.user,
            posts,
            followersCount: baseData.followersCount,
            followingCount: baseData.followingCount,
            followStatus: baseData.followStatus
          }))
        )
      ),
      map(({ user, posts, followersCount, followingCount, followStatus }) => {
        const name = `${user.prenom} ${user.nom}`.trim() || `User #${userId}`;

        return {
          id: userId,
          name,
          avatar: this.initials(name),
          bio: this.buildBio(user.role, user.adresse),
          followers_count: followersCount,
          following_count: followingCount,
          posts_count: posts.length,
          isFollowing: followStatus,
          posts
        };
      })
    );
  }

  private enrichPosts(posts: Post[]): Observable<UserPost[]> {
    if (posts.length === 0) {
      return of([]);
    }

    return forkJoin(
      posts.map((post) =>
        forkJoin({
          likeUserIds: this.postService.getPostLikeUserIds(post.id).pipe(catchError(() => of<number[]>([]))),
          comments: this.commentService.getCommentsByPost(post.id).pipe(catchError(() => of<Comment[]>([])))
        }).pipe(
          map(({ likeUserIds, comments }) => ({
            id: post.id,
            content: post.content,
            image_url: post.image_url ?? null,
            video_url: post.video_url ?? null,
            user_id: post.user_id,
            created_at: post.created_at,
            likesCount: likeUserIds.length,
            commentsCount: comments.length,
            likedByCurrentUser: this.currentUserId !== null && likeUserIds.includes(this.currentUserId)
          }))
        )
      )
    );
  }

  private initials(name: string): string {
    const value = name.trim();
    if (!value) {
      return 'U';
    }

    const initials = value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    return initials || 'U';
  }

  private buildBio(role: string, address: string): string {
    const parts: string[] = [];

    if (role) {
      parts.push(`Role: ${role}`);
    }

    if (address) {
      parts.push(`Location: ${address}`);
    }

    return parts.join(' | ') || 'Community member';
  }

  private isAllowedBackRoute(value: string | null): value is string {
    if (!value) {
      return false;
    }

    return value === '/community/feed' || value === '/community/groups' || value === '/community/qa';
  }
}
