import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Comment, CreateCommentRequest } from '../../models/comment.model';
import { CreatePostRequest, Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { CommunityUserDirectoryService } from '../../services/community-user-directory.service';

interface FeedComment extends Comment {
  likesCount: number;
  likedByCurrentUser: boolean;
}

interface FeedPost extends Post {
  comments: FeedComment[];
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
}

interface TrendingTopic {
  tag: string;
  mentions: number;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  showCreatePost = false;
  posts: FeedPost[] = [];
  errorMessage = '';
  submittingPost = false;
  isLoadingPage = false;
  isLoadingMore = false;
  useInfiniteScroll = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  readonly pageSize = 5;
  sortOrder: 'ASC' | 'DESC' = 'DESC';
  searchTerm = '';
  popularityFilter: 'latest' | 'most-liked' | 'most-commented' = 'latest';
  trendingWindow: '24h' | '7d' = '24h';
  trendingTopics: TrendingTopic[] = [];
  isLoadingTrending = false;
  mediaErrorMessage = '';
  imagePreviewUrl: string | null = null;
  videoPreviewUrl: string | null = null;
  pendingImageDataUrl: string | null = null;
  pendingVideoDataUrl: string | null = null;
  selectedImageName = '';
  selectedVideoName = '';
  processingImage = false;
  processingVideo = false;

  readonly maxImageSizeBytes = 5 * 1024 * 1024;
  readonly maxVideoSizeBytes = 50 * 1024 * 1024;

  private readonly currentUserId = this.resolveCurrentUserId();
  private readonly openedComments = new Set<number>();
  private readonly loadingComments = new Set<number>();
  private readonly commentControls = new Map<number, FormControl<string>>();
  private readonly localMediaByPostId = new Map<number, { imageUrl: string | null; videoUrl: string | null }>();
  private readonly localMediaStorageKey = 'community.localPostMedia.v1';
  private readonly pageCache = new Map<number, FeedPost[]>();
  private readonly stateStorageKey = 'community.feed.pagination.v1';
  private restoreScrollY: number | null = null;
  private searchDebounceHandle: ReturnType<typeof setTimeout> | null = null;

  readonly createPostForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
    image_url: [''],
    video_url: ['']
  });

  constructor(
    private readonly router: Router,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly userDirectory: CommunityUserDirectoryService
  ) {}

  ngOnInit(): void {
    this.restoreState();
    this.restoreLocalMediaRegistry();
    this.refreshTrendingTopics();
    this.loadPosts();
  }

  ngOnDestroy(): void {
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }

    this.revokeImagePreviewUrl();
    this.revokeVideoPreviewUrl();
    this.persistState();
  }

  loadPosts(page = this.currentPage, forceRefresh = false): void {
    const pageNumber = Math.max(1, Math.floor(page));
    const cached = this.pageCache.get(pageNumber);

    if (!forceRefresh && cached) {
      this.currentPage = pageNumber;
      this.rebuildVisiblePosts();
      return;
    }

    if (this.useInfiniteScroll && pageNumber > 1) {
      this.isLoadingMore = true;
    } else {
      this.isLoadingPage = true;
    }

    this.postService
      .getFeedPostsPage(pageNumber, this.pageSize, {
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

        const mapped = this.sortPostsForDisplay(response.data.map((post) => this.mapPost(post)));
        const filtered = this.applyAdvancedFilters(mapped);
        const ranked = this.sortPostsByPopularity(filtered);
        const pageItems = this.normalizePageItems(ranked, pageNumber, response.pageSize, response.currentPage);

        if (this.hasAdvancedFilter()) {
          this.totalItems = filtered.length;
          this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
        }

        pageItems.forEach((post) => this.ensureCommentControl(post.id));
        this.hydratePostAuthors(pageItems);
        pageItems.forEach((post) => this.refreshPostEngagement(post));

        this.pageCache.set(pageNumber, pageItems);
        this.rebuildVisiblePosts();

        if (this.restoreScrollY !== null) {
          setTimeout(() => {
            window.scrollTo({ top: this.restoreScrollY ?? 0, behavior: 'auto' });
            this.restoreScrollY = null;
          }, 60);
        }

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

  get hasSelectedMedia(): boolean {
    return Boolean(this.createPostForm.controls.image_url.value || this.createPostForm.controls.video_url.value);
  }

  get isProcessingMedia(): boolean {
    return this.processingImage || this.processingVideo;
  }

  get searchSuggestions(): string[] {
    const query = this.searchTerm.trim().toLowerCase();
    const suggestions = new Set<string>();

    this.pageCache.forEach((items) => {
      items.forEach((post) => {
        const content = post.content.trim();
        const author = (post.author_name || this.userDirectory.getCachedDisplay(post.user_id)?.fullName || '').trim();

        if (content) {
          suggestions.add(content.slice(0, 60));
        }

        if (author) {
          suggestions.add(author);
        }

        this.extractHashtags(post.content).forEach((tag) => suggestions.add(tag));
      });
    });

    this.trendingTopics.forEach((topic) => suggestions.add(topic.tag));

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
    this.loadPosts(target);

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
    if (!this.canLoadMore()) {
      return;
    }

    this.goToPage(this.currentPage + 1);
  }

  toggleInfiniteScroll(): void {
    this.useInfiniteScroll = !this.useInfiniteScroll;
    if (!this.useInfiniteScroll) {
      this.rebuildVisiblePosts();
    } else {
      this.currentPage = 1;
      this.pageCache.clear();
      this.loadPosts(1, true);
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
    const allowed = value === 'most-liked' || value === 'most-commented' ? value : 'latest';
    this.popularityFilter = allowed;
    this.resetAndReload();
  }

  clearAdvancedFilters(): void {
    this.searchTerm = '';
    this.popularityFilter = 'latest';
    this.resetAndReload();
  }

  changeTrendingWindow(window: '24h' | '7d'): void {
    this.trendingWindow = window;
    this.refreshTrendingTopics();
  }

  searchByHashtag(tag: string): void {
    const normalized = tag.trim();
    if (!normalized) {
      return;
    }

    this.searchTerm = normalized.startsWith('#') ? normalized : `#${normalized}`;
    this.resetAndReload();
  }

  hashtagsForPost(post: FeedPost): string[] {
    return this.extractHashtags(post.content);
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

  toggleLike(post: FeedPost): void {
    const request$ = post.likedByCurrentUser
      ? this.postService.unlikePost(post.id)
      : this.postService.likePost(post.id);

    request$.subscribe({
      next: () => this.refreshPostLikes(post),
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  toggleComments(postId: number): void {
    if (this.openedComments.has(postId)) {
      this.openedComments.delete(postId);
      return;
    }

    this.openedComments.add(postId);

    const post = this.posts.find((item) => item.id === postId);
    if (post && post.comments.length === 0) {
      this.loadComments(post);
    }
  }

  isCommentsOpen(postId: number): boolean {
    return this.openedComments.has(postId);
  }

  isLoadingComments(postId: number): boolean {
    return this.loadingComments.has(postId);
  }

  addComment(post: FeedPost): void {
    const control = this.getCommentControl(post.id);
    if (control.invalid) {
      control.markAsTouched();
      return;
    }

    const payload: CreateCommentRequest = {
      content: control.value.trim(),
      post_id: post.id
    };

    this.commentService.addComment(payload).subscribe({
      next: (createdComment) => {
        const mapped = this.mapComment(createdComment, post.id);
        post.comments = [mapped, ...post.comments];
        post.commentsCount = post.comments.length;
        post.comments_count = post.commentsCount;
        this.hydrateCommentAuthors(post.comments);
        this.refreshCommentLikes(mapped);
        if (this.popularityFilter === 'most-commented') {
          this.rebuildVisiblePosts();
        }
        control.reset('');
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  toggleCommentLike(comment: FeedComment): void {
    const request$ = comment.likedByCurrentUser
      ? this.commentService.unlikeComment(comment.id)
      : this.commentService.likeComment(comment.id);

    request$.subscribe({
      next: () => this.refreshCommentLikes(comment),
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  viewProfile(userId: number): void {
    this.router.navigate(['/community/profile', userId], {
      queryParams: { from: this.router.url }
    });
  }

  closeCreatePost(preserveCurrentPreviewUrls = false): void {
    this.showCreatePost = false;
    this.mediaErrorMessage = '';

    if (preserveCurrentPreviewUrls) {
      this.revokeImagePreviewUrl();
      this.revokeVideoPreviewUrl();

      this.selectedImageName = '';
      this.selectedVideoName = '';
      this.processingImage = false;
      this.processingVideo = false;
      this.pendingImageDataUrl = null;
      this.pendingVideoDataUrl = null;
      this.imagePreviewUrl = null;
      this.videoPreviewUrl = null;
      this.createPostForm.patchValue({ image_url: '', video_url: '' });
    } else {
      this.removeMedia();
    }

    this.createPostForm.reset({ content: '', image_url: '', video_url: '' });
    this.createPostForm.markAsPristine();
    this.createPostForm.markAsUntouched();
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!this.isAllowedImageFile(file)) {
      this.mediaErrorMessage = 'Invalid image type. Please select JPG, JPEG, or PNG.';
      return;
    }

    if (file.size > this.maxImageSizeBytes) {
      this.mediaErrorMessage = 'Image is too large. Maximum size is 5 MB.';
      return;
    }

    this.mediaErrorMessage = '';
    this.processingImage = true;
    this.selectedImageName = file.name;
    this.revokeImagePreviewUrl();
    this.imagePreviewUrl = URL.createObjectURL(file);

    try {
      this.pendingImageDataUrl = await this.readFileAsDataUrl(file);
      this.createPostForm.patchValue({ image_url: this.imagePreviewUrl });
    } catch {
      this.pendingImageDataUrl = null;
      this.mediaErrorMessage = 'Failed to prepare image. Please try another file.';
      this.revokeImagePreviewUrl();
      this.selectedImageName = '';
      this.createPostForm.patchValue({ image_url: '' });
    } finally {
      this.processingImage = false;
    }
  }

  async onVideoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!this.isAllowedVideoFile(file)) {
      this.mediaErrorMessage = 'Invalid video type. Please select MP4 or MOV.';
      return;
    }

    if (file.size > this.maxVideoSizeBytes) {
      this.mediaErrorMessage = 'Video is too large. Maximum size is 50 MB.';
      return;
    }

    this.mediaErrorMessage = '';
    this.processingVideo = true;
    this.selectedVideoName = file.name;
    this.revokeVideoPreviewUrl();
    this.videoPreviewUrl = URL.createObjectURL(file);

    try {
      this.pendingVideoDataUrl = await this.readFileAsDataUrl(file);
      this.createPostForm.patchValue({ video_url: this.videoPreviewUrl });
    } catch {
      this.pendingVideoDataUrl = null;
      this.mediaErrorMessage = 'Failed to prepare video. Please try another file.';
      this.revokeVideoPreviewUrl();
      this.selectedVideoName = '';
      this.createPostForm.patchValue({ video_url: '' });
    } finally {
      this.processingVideo = false;
    }
  }

  removeImage(): void {
    this.selectedImageName = '';
    this.pendingImageDataUrl = null;
    this.createPostForm.patchValue({ image_url: '' });
    this.revokeImagePreviewUrl();
  }

  removeVideo(): void {
    this.selectedVideoName = '';
    this.pendingVideoDataUrl = null;
    this.createPostForm.patchValue({ video_url: '' });
    this.revokeVideoPreviewUrl();
  }

  removeMedia(): void {
    this.removeImage();
    this.removeVideo();
  }

  createPost(): void {
    if (this.createPostForm.invalid || this.submittingPost) {
      this.createPostForm.markAllAsTouched();
      return;
    }

    if (this.isProcessingMedia) {
      this.mediaErrorMessage = 'Please wait until media files are ready.';
      return;
    }

    this.mediaErrorMessage = '';

    const { content, image_url, video_url } = this.createPostForm.getRawValue();
    const localImageUrl = this.pendingImageDataUrl;
    const localVideoUrl = this.pendingVideoDataUrl;
    const payload: CreatePostRequest = {
      content: content.trim(),
      image_url: this.toPersistedMediaUrl(image_url),
      video_url: this.toPersistedMediaUrl(video_url),
      group_id: null
    };

    this.submittingPost = true;
    this.postService.createPost(payload).subscribe({
      next: (createdPost) => {
        this.errorMessage = '';
        const mapped = this.mapPost(createdPost);
        this.retainLocalMediaForPost(mapped.id, localImageUrl, localVideoUrl);
        this.applyLocalMedia(mapped);
        this.ensureCommentControl(mapped.id);
        this.hydratePostAuthors([mapped]);
        this.refreshPostEngagement(mapped);

        this.currentPage = 1;
        this.pageCache.clear();
        this.loadPosts(1, true);
        this.refreshTrendingTopics();
        this.closeCreatePost(true);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
      complete: () => {
        this.submittingPost = false;
      }
    });
  }

  getCommentControl(postId: number): FormControl<string> {
    return this.ensureCommentControl(postId);
  }

  postAuthorName(post: FeedPost): string {
    return post.author_name || `User #${post.user_id}`;
  }

  commentAuthorName(comment: FeedComment): string {
    return comment.author_name || `User #${comment.user_id}`;
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

  private ensureCommentControl(postId: number): FormControl<string> {
    const existing = this.commentControls.get(postId);
    if (existing) {
      return existing;
    }

    const control = this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]);
    this.commentControls.set(postId, control);
    return control;
  }

  private mapPost(post: Post): FeedPost {
    const comments = Array.isArray(post.comments)
      ? post.comments.map((comment) => this.mapComment(comment, post.id))
      : [];

    const mapped: FeedPost = {
      ...post,
      comments,
      likesCount: post.likes_count ?? 0,
      commentsCount: post.comments_count ?? comments.length,
      likedByCurrentUser: Boolean(post.is_liked)
    };

    this.applyLocalMedia(mapped);
    return mapped;
  }

  private mapComment(comment: Comment, postId: number): FeedComment {
    return {
      ...comment,
      post_id: comment.post_id ?? postId,
      likesCount: comment.likes_count ?? 0,
      likedByCurrentUser: Boolean(comment.is_liked)
    };
  }

  private loadComments(post: FeedPost): void {
    this.loadingComments.add(post.id);

    this.commentService.getCommentsByPost(post.id).subscribe({
      next: (comments) => {
        post.comments = comments.map((comment) => this.mapComment(comment, post.id));
        post.commentsCount = post.comments.length;
        post.comments_count = post.commentsCount;
        this.hydrateCommentAuthors(post.comments);
        post.comments.forEach((comment) => this.refreshCommentLikes(comment));
        if (this.popularityFilter === 'most-commented') {
          this.rebuildVisiblePosts();
        }
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
      complete: () => {
        this.loadingComments.delete(post.id);
      }
    });
  }

  private hydratePostAuthors(posts: FeedPost[]): void {
    const userIds = posts.map((post) => post.user_id);
    this.userDirectory.resolveUsers(userIds).subscribe({
      next: (users) => {
        posts.forEach((post) => {
          const match = users.get(post.user_id);
          if (match) {
            post.author_name = match.fullName;
          }
        });
      }
    });
  }

  private hydrateCommentAuthors(comments: FeedComment[]): void {
    const userIds = comments.map((comment) => comment.user_id);
    this.userDirectory.resolveUsers(userIds).subscribe({
      next: (users) => {
        comments.forEach((comment) => {
          const match = users.get(comment.user_id);
          if (match) {
            comment.author_name = match.fullName;
          }
        });
      }
    });
  }

  private refreshPostEngagement(post: FeedPost): void {
    forkJoin({
      likeUserIds: this.postService.getPostLikeUserIds(post.id).pipe(catchError(() => of<number[]>([]))),
      comments: this.commentService.getCommentsByPost(post.id).pipe(catchError(() => of<Comment[]>([])))
    }).subscribe({
      next: ({ likeUserIds, comments }) => {
        post.likesCount = likeUserIds.length;
        post.likes_count = post.likesCount;
        post.likedByCurrentUser = this.currentUserId !== null && likeUserIds.includes(this.currentUserId);
        post.is_liked = post.likedByCurrentUser;

        post.commentsCount = comments.length;
        post.comments_count = post.commentsCount;

        if (this.popularityFilter !== 'latest') {
          this.rebuildVisiblePosts();
        }
      }
    });
  }

  private refreshPostLikes(post: FeedPost): void {
    this.postService
      .getPostLikeUserIds(post.id)
      .pipe(catchError(() => of<number[]>([])))
      .subscribe((likeUserIds) => {
        post.likesCount = likeUserIds.length;
        post.likes_count = post.likesCount;
        post.likedByCurrentUser = this.currentUserId !== null && likeUserIds.includes(this.currentUserId);
        post.is_liked = post.likedByCurrentUser;

        if (this.popularityFilter === 'most-liked') {
          this.rebuildVisiblePosts();
        }
      });
  }

  private refreshCommentLikes(comment: FeedComment): void {
    this.commentService
      .getCommentLikeUserIds(comment.id)
      .pipe(catchError(() => of<number[]>([])))
      .subscribe((likeUserIds) => {
        comment.likesCount = likeUserIds.length;
        comment.likes_count = comment.likesCount;
        comment.likedByCurrentUser = this.currentUserId !== null && likeUserIds.includes(this.currentUserId);
        comment.is_liked = comment.likedByCurrentUser;
      });
  }

  private resolveCurrentUserId(): number | null {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }

    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser) as Record<string, unknown>;
        const idValue = user['idUser'] ?? user['userId'] ?? user['id'];
        const parsed = this.tryParseNumber(idValue);
        if (parsed !== null) {
          return parsed;
        }
      } catch {
        // Ignore malformed user payload
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const payload = this.base64UrlDecode(parts[1]);
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      return (
        this.tryParseNumber(parsed['idUser']) ??
        this.tryParseNumber(parsed['userId']) ??
        this.tryParseNumber(parsed['id']) ??
        this.tryParseNumber(parsed['sub'])
      );
    } catch {
      return null;
    }
  }

  private base64UrlDecode(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  private tryParseNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private isAllowedImageFile(file: File): boolean {
    const type = (file.type || '').toLowerCase();
    const name = file.name.toLowerCase();

    return type === 'image/jpeg' || type === 'image/png' || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png');
  }

  private isAllowedVideoFile(file: File): boolean {
    const type = (file.type || '').toLowerCase();
    const name = file.name.toLowerCase();

    return type === 'video/mp4' || type === 'video/quicktime' || name.endsWith('.mp4') || name.endsWith('.mov');
  }

  private toPersistedMediaUrl(value: string): string | null {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    if (normalized.startsWith('blob:')) {
      return null;
    }

    return normalized;
  }

  private retainLocalMediaForPost(postId: number, imageUrl: string | null, videoUrl: string | null): void {
    const normalizedImage = this.normalizeDataUrl(imageUrl);
    const normalizedVideo = this.normalizeDataUrl(videoUrl);

    if (!normalizedImage && !normalizedVideo) {
      return;
    }

    this.localMediaByPostId.set(postId, {
      imageUrl: normalizedImage,
      videoUrl: normalizedVideo
    });

    this.persistLocalMediaRegistry();
  }

  private applyLocalMedia(post: FeedPost): void {
    const localMedia = this.localMediaByPostId.get(post.id);
    if (!localMedia) {
      return;
    }

    if (!post.image_url && localMedia.imageUrl) {
      post.image_url = localMedia.imageUrl;
    }

    if (!post.video_url && localMedia.videoUrl) {
      post.video_url = localMedia.videoUrl;
    }
  }

  private async readFileAsDataUrl(file: File): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string' && reader.result.trim().length > 0) {
          resolve(reader.result);
          return;
        }

        reject(new Error('Empty data URL'));
      };

      reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private persistLocalMediaRegistry(): void {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    const entries = Array.from(this.localMediaByPostId.entries())
      .map(([postId, media]) => {
        const imageUrl = this.normalizeDataUrl(media.imageUrl);
        const videoUrl = this.normalizeDataUrl(media.videoUrl);
        return [postId, { imageUrl, videoUrl }] as const;
      })
      .filter(([, media]) => Boolean(media.imageUrl || media.videoUrl));

    while (entries.length > 0) {
      const snapshot: Record<string, { imageUrl: string | null; videoUrl: string | null }> = {};
      entries.slice(-30).forEach(([postId, media]) => {
        snapshot[String(postId)] = media;
      });

      try {
        localStorage.setItem(this.localMediaStorageKey, JSON.stringify(snapshot));
        return;
      } catch {
        entries.shift();
      }
    }
  }

  private restoreLocalMediaRegistry(): void {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    const raw = localStorage.getItem(this.localMediaStorageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, { imageUrl?: string | null; videoUrl?: string | null }>;
      Object.entries(parsed).forEach(([rawPostId, media]) => {
        const postId = Number(rawPostId);
        if (!Number.isFinite(postId)) {
          return;
        }

        const imageUrl = this.normalizeDataUrl(media?.imageUrl ?? null);
        const videoUrl = this.normalizeDataUrl(media?.videoUrl ?? null);
        if (!imageUrl && !videoUrl) {
          return;
        }

        this.localMediaByPostId.set(postId, { imageUrl, videoUrl });
      });
    } catch {
      localStorage.removeItem(this.localMediaStorageKey);
    }
  }

  private normalizeDataUrl(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.startsWith('data:') ? normalized : null;
  }

  private revokeImagePreviewUrl(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = null;
    }
  }

  private revokeVideoPreviewUrl(): void {
    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl);
      this.videoPreviewUrl = null;
    }
  }

  private refreshTrendingTopics(): void {
    this.isLoadingTrending = true;

    this.postService
      .getFeedPostsPage(1, 200, { sortBy: 'createdAt', sortOrder: 'DESC' })
      .pipe(catchError(() => of({ data: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 200 })))
      .subscribe({
        next: (response) => {
          const topics = new Map<string, number>();
          const windowMillis = this.trendingWindow === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
          const now = Date.now();

          response.data.forEach((post) => {
            const createdAt = this.createdAtTimestamp(post.created_at);
            if (createdAt > 0 && now - createdAt > windowMillis) {
              return;
            }

            this.extractHashtags(post.content).forEach((tag) => {
              const key = tag.toLowerCase();
              topics.set(key, (topics.get(key) ?? 0) + 1);
            });
          });

          this.trendingTopics = Array.from(topics.entries())
            .map(([tag, mentions]) => ({ tag, mentions }))
            .sort((left, right) => right.mentions - left.mentions)
            .slice(0, 8);
        },
        complete: () => {
          this.isLoadingTrending = false;
        }
      });
  }

  private applyAdvancedFilters(posts: FeedPost[]): FeedPost[] {
    const query = this.searchTerm.trim().toLowerCase();

    return posts.filter((post) => {
      const content = (post.content || '').toLowerCase();
      const author = (post.author_name || this.userDirectory.getCachedDisplay(post.user_id)?.fullName || '').toLowerCase();
      const hashtags = this.extractHashtags(post.content).map((tag) => tag.toLowerCase());

      if (query) {
        const normalizedQuery = query.startsWith('#') ? query : `#${query}`;
        const matchesQuery =
          content.includes(query) ||
          author.includes(query) ||
          hashtags.some((tag) => tag.includes(query) || tag.includes(normalizedQuery));

        if (!matchesQuery) {
          return false;
        }
      }

      return true;
    });
  }

  private sortPostsByPopularity(posts: FeedPost[]): FeedPost[] {
    if (this.popularityFilter === 'latest') {
      return posts;
    }

    return [...posts].sort((left, right) => {
      const leftLikes = left.likes_count ?? left.likesCount ?? 0;
      const rightLikes = right.likes_count ?? right.likesCount ?? 0;
      const leftComments = left.comments_count ?? left.commentsCount ?? 0;
      const rightComments = right.comments_count ?? right.commentsCount ?? 0;

      if (this.popularityFilter === 'most-liked') {
        if (leftLikes === rightLikes) {
          return this.createdAtTimestamp(right.created_at) - this.createdAtTimestamp(left.created_at);
        }

        return rightLikes - leftLikes;
      }

      if (leftComments === rightComments) {
        return this.createdAtTimestamp(right.created_at) - this.createdAtTimestamp(left.created_at);
      }

      return rightComments - leftComments;
    });
  }

  private hasAdvancedFilter(): boolean {
    const query = this.searchTerm.trim();

    return this.popularityFilter !== 'latest' || query.startsWith('#');
  }

  private extractHashtags(content: string): string[] {
    const matches = (content || '').match(/#[A-Za-z0-9_]+/g) ?? [];
    return Array.from(new Set(matches));
  }

  private sortPostsForDisplay(posts: FeedPost[]): FeedPost[] {
    return [...posts].sort((left, right) => {
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
    items: FeedPost[],
    requestedPage: number,
    serverPageSize: number,
    serverCurrentPage: number
  ): FeedPost[] {
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

  private rebuildVisiblePosts(): void {
    if (!this.useInfiniteScroll) {
      this.posts = this.orderPostsForDisplay([...(this.pageCache.get(this.currentPage) ?? [])]);
      return;
    }

    const merged: FeedPost[] = [];
    for (let page = 1; page <= this.currentPage; page += 1) {
      const items = this.pageCache.get(page);
      if (items?.length) {
        merged.push(...items);
      }
    }

    this.posts = this.orderPostsForDisplay(merged);
  }

  private orderPostsForDisplay(posts: FeedPost[]): FeedPost[] {
    if (this.popularityFilter === 'most-liked' || this.popularityFilter === 'most-commented') {
      return this.sortPostsByPopularity(posts);
    }

    return this.sortPostsForDisplay(posts);
  }

  private resetAndReload(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.pageCache.clear();
    this.loadPosts(1, true);
    this.persistState();
  }

  private persistState(): void {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
      return;
    }

    const state = {
      currentPage: this.currentPage,
      useInfiniteScroll: this.useInfiniteScroll,
      sortOrder: this.sortOrder,
      searchTerm: this.searchTerm,
      popularityFilter: this.popularityFilter,
      trendingWindow: this.trendingWindow,
      scrollY: window.scrollY
    };

    sessionStorage.setItem(this.stateStorageKey, JSON.stringify(state));
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
        popularityFilter?: 'latest' | 'most-liked' | 'most-commented';
        trendingWindow?: '24h' | '7d';
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

      if (
        state.popularityFilter === 'latest' ||
        state.popularityFilter === 'most-liked' ||
        state.popularityFilter === 'most-commented'
      ) {
        this.popularityFilter = state.popularityFilter;
      }

      if (state.trendingWindow === '24h' || state.trendingWindow === '7d') {
        this.trendingWindow = state.trendingWindow;
      }

      if (Number.isFinite(state.scrollY)) {
        this.restoreScrollY = state.scrollY as number;
      }
    } catch {
      // Ignore malformed pagination state
    }
  }
}
