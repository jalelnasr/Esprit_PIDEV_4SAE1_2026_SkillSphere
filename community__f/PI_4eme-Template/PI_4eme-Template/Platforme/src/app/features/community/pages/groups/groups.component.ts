import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { ToastService } from '@core/services';
import { GroupMembershipRecord, GroupService } from '../../services/group.service';
import { PostService } from '../../services/post.service';
import { CommunityUserDirectoryService } from '../../services/community-user-directory.service';
import { CreateGroupRequest, Group } from '../../models/group.model';
import { CreatePostRequest, Post } from '../../models/post.model';

interface GroupPost extends Post {
  likes?: number;
  isLiked?: boolean;
}

interface GroupView extends Group {
  posts: GroupPost[];
}

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  groups: GroupView[] = [];
  showCreateGroup = false;
  creatingGroup = false;
  errorMessage = '';
  isLoadingPage = false;
  isLoadingMore = false;
  useInfiniteScroll = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  readonly pageSize = 5;
  sortOrder: 'ASC' | 'DESC' = 'DESC';
  searchTerm = '';
  groupFilter: 'all' | 'joined' | 'not-joined' = 'all';
  popularityFilter: 'latest' | 'most-members' = 'latest';

  readonly maxImageSizeBytes = 5 * 1024 * 1024;
  readonly maxVideoSizeBytes = 50 * 1024 * 1024;
  private readonly currentUserId = this.resolveCurrentUserId();

  private readonly openGroupPosts = new Set<number>();
  private readonly loadingGroupPosts = new Set<number>();
  private readonly groupPostControls = new Map<number, FormControl<string>>();
  private readonly groupMediaErrors = new Map<number, string>();
  private readonly groupImagePreviewUrls = new Map<number, string>();
  private readonly groupVideoPreviewUrls = new Map<number, string>();
  private readonly groupImageNames = new Map<number, string>();
  private readonly groupVideoNames = new Map<number, string>();
  private readonly localMediaByPostId = new Map<number, { imageUrl: string | null; videoUrl: string | null }>();
  private readonly retainedMediaUrls = new Set<string>();
  private readonly joinedGroupIds = new Set<number>();
  private readonly groupRoles = new Map<number, string>();
  private readonly joiningGroupIds = new Set<number>();
  private readonly leavingGroupIds = new Set<number>();
  private readonly pageCache = new Map<number, GroupView[]>();
  private readonly stateStorageKey = 'community.groups.pagination.v1';
  private searchDebounceHandle: ReturnType<typeof setTimeout> | null = null;

  readonly createGroupForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(
    private router: Router,
    private groupService: GroupService,
    private postService: PostService,
    private userDirectory: CommunityUserDirectoryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.restoreState();
    this.loadGroups();
  }

  ngOnDestroy(): void {
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }

    this.groupImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    this.groupVideoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    this.retainedMediaUrls.forEach((url) => URL.revokeObjectURL(url));
    this.groupImagePreviewUrls.clear();
    this.groupVideoPreviewUrls.clear();
    this.retainedMediaUrls.clear();

    this.persistState();
  }

  loadGroups(page = this.currentPage, forceRefresh = false): void {
    const pageNumber = Math.max(1, Math.floor(page));
    const cached = this.pageCache.get(pageNumber);

    if (!forceRefresh && cached) {
      this.currentPage = pageNumber;
      this.rebuildVisibleGroups();
      return;
    }

    if (this.useInfiniteScroll && pageNumber > 1) {
      this.isLoadingMore = true;
    } else {
      this.isLoadingPage = true;
    }

    forkJoin({
      groupsPage: this.groupService.getGroupsPage(pageNumber, this.pageSize, {
        sortBy: 'createdAt',
        sortOrder: this.sortOrder,
        search: this.searchTerm
      }),
      memberships: this.groupService.getMemberships().pipe(catchError(() => of<GroupMembershipRecord[]>([])))
    }).subscribe({
      next: ({ groupsPage, memberships }) => {
        this.errorMessage = '';
        this.currentPage = Math.max(1, groupsPage.currentPage || pageNumber);
        this.totalPages = Math.max(1, groupsPage.totalPages || 1);
        this.totalItems = Math.max(0, groupsPage.totalItems);

        this.joinedGroupIds.clear();
        this.groupRoles.clear();
        memberships.forEach((membership) => {
          this.joinedGroupIds.add(membership.groupId);
          this.groupRoles.set(membership.groupId, membership.role || 'membre');
        });

        const mappedGroups = this.sortGroupsForDisplay(groupsPage.data.map((group) => {
          const mapped = this.mapGroup(group);
          mapped.is_member = this.joinedGroupIds.has(mapped.id);
          return mapped;
        }));

        const filtered = this.applyAdvancedFilters(mappedGroups);
        const ranked = this.sortGroupsByPopularity(filtered);
        const pageItems = this.normalizePageItems(ranked, pageNumber, groupsPage.pageSize, groupsPage.currentPage);

        if (this.hasAdvancedFilter()) {
          this.totalItems = filtered.length;
          this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
        }

        this.hydrateGroupPostAuthors(pageItems.flatMap((group) => group.posts));
        this.pageCache.set(pageNumber, pageItems);
        this.rebuildVisibleGroups();
        this.persistState();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.toast.error('Failed to load groups');
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

  get searchSuggestions(): string[] {
    const query = this.searchTerm.trim().toLowerCase();
    const suggestions = new Set<string>();

    this.pageCache.forEach((items) => {
      items.forEach((group) => {
        if (group.name?.trim()) {
          suggestions.add(group.name.trim());
        }

        if (group.description?.trim()) {
          suggestions.add(group.description.trim().slice(0, 80));
        }
      });
    });

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
    this.loadGroups(target);

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
    if (this.canLoadMore()) {
      this.goToPage(this.currentPage + 1);
    }
  }

  toggleInfiniteScroll(): void {
    this.useInfiniteScroll = !this.useInfiniteScroll;

    if (!this.useInfiniteScroll) {
      this.rebuildVisibleGroups();
    } else {
      this.currentPage = 1;
      this.pageCache.clear();
      this.loadGroups(1, true);
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

  updateGroupFilter(value: string): void {
    if (value === 'joined' || value === 'not-joined') {
      this.groupFilter = value;
    } else {
      this.groupFilter = 'all';
    }

    this.resetAndReload();
  }

  updatePopularityFilter(value: string): void {
    this.popularityFilter = value === 'most-members' ? 'most-members' : 'latest';
    this.resetAndReload();
  }

  clearAdvancedFilters(): void {
    this.groupFilter = 'all';
    this.popularityFilter = 'latest';
    this.resetAndReload();
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

  openCreateGroupModal(): void {
    this.showCreateGroup = true;
  }

  closeCreateGroupModal(): void {
    this.showCreateGroup = false;
    this.createGroupForm.reset({ name: '', description: '' });
    this.createGroupForm.markAsPristine();
    this.createGroupForm.markAsUntouched();
  }

  createGroup(): void {
    if (this.createGroupForm.invalid || this.creatingGroup) {
      this.createGroupForm.markAllAsTouched();
      return;
    }

    const raw = this.createGroupForm.getRawValue();
    const payload: CreateGroupRequest = {
      name: raw.name.trim(),
      description: raw.description.trim()
    };

    this.creatingGroup = true;
    this.groupService
      .createGroup(payload)
      .pipe(finalize(() => (this.creatingGroup = false)))
      .subscribe({
        next: (createdGroup) => {
          this.errorMessage = '';
          const mapped = this.mapGroup(createdGroup);
          this.joinedGroupIds.add(mapped.id);
          this.groupRoles.set(mapped.id, 'admin');
          mapped.is_member = true;
          this.currentPage = 1;
          this.pageCache.clear();
          this.loadGroups(1, true);
          this.closeCreateGroupModal();
          this.toast.success('Group created');
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.toast.error(error.message || 'Failed to create group');
        }
      });
  }

  isGroupMember(group: GroupView): boolean {
    return this.joinedGroupIds.has(group.id) || Boolean(group.is_member);
  }

  isJoiningGroup(groupId: number): boolean {
    return this.joiningGroupIds.has(groupId);
  }

  isLeavingGroup(groupId: number): boolean {
    return this.leavingGroupIds.has(groupId);
  }

  membershipRole(group: GroupView): string | null {
    const role = this.groupRoles.get(group.id);
    if (role) {
      return role;
    }

    if (this.isGroupCreator(group)) {
      return 'admin';
    }

    return group.is_member ? 'membre' : null;
  }

  membershipRoleLabel(group: GroupView): string {
    const role = this.membershipRole(group);
    if (!role) {
      return '';
    }

    const normalized = role.trim().toLowerCase();
    if (normalized === 'admin') {
      return 'Admin';
    }

    if (normalized === 'membre' || normalized === 'member') {
      return 'Membre';
    }

    return role;
  }

  isGroupAdmin(group: GroupView): boolean {
    return (this.membershipRole(group) ?? '').toLowerCase() === 'admin' || this.isGroupCreator(group);
  }

  groupMembersCount(group: GroupView): number {
    return group.members_count ?? 0;
  }

  joinGroup(group: GroupView): void {
    if (this.isGroupMember(group)) {
      this.toast.warning('User already joined');
      return;
    }

    if (this.isJoiningGroup(group.id)) {
      return;
    }

    this.joiningGroupIds.add(group.id);
    this.joinedGroupIds.add(group.id);
    this.groupRoles.set(group.id, 'membre');
    group.is_member = true;
    group.members_count = this.groupMembersCount(group) + 1;

    if (this.popularityFilter === 'most-members') {
      this.rebuildVisibleGroups();
    }

    this.groupService
      .joinGroup(group.id)
      .pipe(finalize(() => this.joiningGroupIds.delete(group.id)))
      .subscribe({
        next: (response) => {
          this.errorMessage = '';
          const role = response.role || 'membre';
          this.groupRoles.set(group.id, role);
          this.toast.success('Joined group successfully');
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          if (error.message.toLowerCase().includes('already')) {
            this.joinedGroupIds.add(group.id);
            this.groupRoles.set(group.id, this.groupRoles.get(group.id) || 'membre');
            group.is_member = true;
          } else {
            this.joinedGroupIds.delete(group.id);
            this.groupRoles.delete(group.id);
            group.is_member = false;
            group.members_count = Math.max(0, this.groupMembersCount(group) - 1);

            if (this.popularityFilter === 'most-members') {
              this.rebuildVisibleGroups();
            }
          }
          this.toast.error(error.message || 'Failed to join group');
        }
      });
  }

  leaveGroup(group: GroupView): void {
    if (!this.isGroupMember(group) || this.isLeavingGroup(group.id)) {
      return;
    }

    if (this.isGroupAdmin(group)) {
      this.toast.warning('Admin creator cannot leave this group');
      return;
    }

    this.leavingGroupIds.add(group.id);
    this.joinedGroupIds.delete(group.id);
    this.groupRoles.delete(group.id);
    group.is_member = false;
    group.members_count = Math.max(0, this.groupMembersCount(group) - 1);
    this.openGroupPosts.delete(group.id);

    if (this.popularityFilter === 'most-members') {
      this.rebuildVisibleGroups();
    }

    this.groupService
      .leaveGroup(group.id)
      .pipe(finalize(() => this.leavingGroupIds.delete(group.id)))
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.toast.success('Left group successfully');
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.joinedGroupIds.add(group.id);
          this.groupRoles.set(group.id, 'membre');
          group.is_member = true;
          group.members_count = this.groupMembersCount(group) + 1;

          if (this.popularityFilter === 'most-members') {
            this.rebuildVisibleGroups();
          }
          this.toast.error(error.message || 'Failed to leave group');
        }
      });
  }

  togglePosts(group: GroupView): void {
    if (!this.isGroupMember(group)) {
      this.toast.warning('Join this group to view posts');
      return;
    }

    if (this.openGroupPosts.has(group.id)) {
      this.openGroupPosts.delete(group.id);
      return;
    }

    this.openGroupPosts.add(group.id);
    if (!group.posts.length) {
      this.loadGroupPosts(group.id);
    }
  }

  isPostsOpen(groupId: number): boolean {
    return this.openGroupPosts.has(groupId);
  }

  isLoadingGroupPosts(groupId: number): boolean {
    return this.loadingGroupPosts.has(groupId);
  }

  getGroupPostControl(groupId: number): FormControl<string> {
    const existing = this.groupPostControls.get(groupId);
    if (existing) {
      return existing;
    }

    const control = this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(1000)
    ]);

    this.groupPostControls.set(groupId, control);
    return control;
  }

  groupHasSelectedMedia(groupId: number): boolean {
    return Boolean(this.groupImagePreviewUrls.get(groupId) || this.groupVideoPreviewUrls.get(groupId));
  }

  groupImagePreview(groupId: number): string | null {
    return this.groupImagePreviewUrls.get(groupId) ?? null;
  }

  groupVideoPreview(groupId: number): string | null {
    return this.groupVideoPreviewUrls.get(groupId) ?? null;
  }

  groupSelectedImageName(groupId: number): string {
    return this.groupImageNames.get(groupId) ?? '';
  }

  groupSelectedVideoName(groupId: number): string {
    return this.groupVideoNames.get(groupId) ?? '';
  }

  groupMediaError(groupId: number): string {
    return this.groupMediaErrors.get(groupId) ?? '';
  }

  onGroupImageSelected(groupId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!this.isAllowedImageFile(file)) {
      this.groupMediaErrors.set(groupId, 'Invalid image type. Please select JPG, JPEG, or PNG.');
      return;
    }

    if (file.size > this.maxImageSizeBytes) {
      this.groupMediaErrors.set(groupId, 'Image is too large. Maximum size is 5 MB.');
      return;
    }

    this.groupMediaErrors.delete(groupId);
    this.revokeGroupImagePreview(groupId);
    this.groupImagePreviewUrls.set(groupId, URL.createObjectURL(file));
    this.groupImageNames.set(groupId, file.name);
  }

  onGroupVideoSelected(groupId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!this.isAllowedVideoFile(file)) {
      this.groupMediaErrors.set(groupId, 'Invalid video type. Please select MP4 or MOV.');
      return;
    }

    if (file.size > this.maxVideoSizeBytes) {
      this.groupMediaErrors.set(groupId, 'Video is too large. Maximum size is 50 MB.');
      return;
    }

    this.groupMediaErrors.delete(groupId);
    this.revokeGroupVideoPreview(groupId);
    this.groupVideoPreviewUrls.set(groupId, URL.createObjectURL(file));
    this.groupVideoNames.set(groupId, file.name);
  }

  removeGroupImage(groupId: number): void {
    this.revokeGroupImagePreview(groupId);
    this.groupImageNames.delete(groupId);
  }

  removeGroupVideo(groupId: number): void {
    this.revokeGroupVideoPreview(groupId);
    this.groupVideoNames.delete(groupId);
  }

  clearGroupMedia(groupId: number): void {
    this.removeGroupImage(groupId);
    this.removeGroupVideo(groupId);
    this.groupMediaErrors.delete(groupId);
  }

  submitGroupPost(group: GroupView): void {
    if (!this.isGroupMember(group)) {
      this.toast.warning('Join this group to post');
      return;
    }

    const control = this.getGroupPostControl(group.id);
    if (control.invalid) {
      control.markAsTouched();
      return;
    }

    const selectedImageUrl = this.groupImagePreview(group.id);
    const selectedVideoUrl = this.groupVideoPreview(group.id);

    const payload: CreatePostRequest = {
      content: control.value.trim(),
      image_url: this.toPersistedMediaUrl(selectedImageUrl),
      video_url: this.toPersistedMediaUrl(selectedVideoUrl),
      group_id: group.id
    };

    this.postService.createPost(payload).subscribe({
      next: (createdPost) => {
        this.errorMessage = '';
        const mappedPost = this.mapPost(createdPost);
        this.retainGroupMediaForPost(mappedPost.id, group.id);
        this.applyLocalMedia(mappedPost);
        group.posts = [mappedPost, ...group.posts];
        this.hydrateGroupPostAuthors([mappedPost]);
        control.reset('');
        this.toast.success('Post published');
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.toast.error(error.message || 'Failed to publish post');
      }
    });
  }

  togglePostLike(post: GroupPost): void {
    const wasLiked = this.isPostLiked(post);
    const previousLikes = this.getPostLikes(post);

    const request$ = wasLiked
      ? this.postService.unlikePost(post.id)
      : this.postService.likePost(post.id);

    request$.subscribe({
      next: () => {
        post.is_liked = !wasLiked;
        post.likes_count = Math.max(0, previousLikes + (wasLiked ? -1 : 1));
      },
      error: () => {
        post.is_liked = wasLiked;
        post.likes_count = previousLikes;
      }
    });
  }

  getPostLikes(post: GroupPost): number {
    return post.likes_count ?? post.likes ?? 0;
  }

  isPostLiked(post: GroupPost): boolean {
    return Boolean(post.is_liked ?? post.isLiked);
  }

  postAuthorName(post: GroupPost): string {
    return post.author_name || `User #${post.user_id}`;
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

  viewProfile(userId: number): void {
    this.router.navigate(['/community/profile', userId], {
      queryParams: { from: this.router.url }
    });
  }

  private loadGroupPosts(groupId: number): void {
    this.loadingGroupPosts.add(groupId);

    this.groupService
      .getGroupPosts(groupId)
      .pipe(finalize(() => this.loadingGroupPosts.delete(groupId)))
      .subscribe({
        next: (posts) => {
          this.errorMessage = '';
          const group = this.groups.find((item) => item.id === groupId);
          if (!group) {
            return;
          }

          group.posts = posts.map((post) => this.mapPost(post));
          this.hydrateGroupPostAuthors(group.posts);
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.toast.error(error.message || 'Failed to load group posts');
        }
      });
  }

  private mapGroup(group: Group): GroupView {
    const posts = Array.isArray(group.posts) ? group.posts.map((post) => this.mapPost(post)) : [];
    return {
      ...group,
      posts
    };
  }

  private mapPost(post: Post): GroupPost {
    const mapped: GroupPost = {
      ...post,
      likes: post.likes_count,
      isLiked: post.is_liked
    };

    this.applyLocalMedia(mapped);
    return mapped;
  }

  private isGroupCreator(group: GroupView): boolean {
    return this.currentUserId !== null && group.created_by === this.currentUserId;
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

    return null;
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

  private toPersistedMediaUrl(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const normalized = value.trim();
    if (!normalized || normalized.startsWith('blob:')) {
      return null;
    }

    return normalized;
  }

  private retainGroupMediaForPost(postId: number, groupId: number): void {
    const imageUrl = this.groupImagePreview(groupId);
    const videoUrl = this.groupVideoPreview(groupId);

    if (imageUrl) {
      this.retainedMediaUrls.add(imageUrl);
    }

    if (videoUrl) {
      this.retainedMediaUrls.add(videoUrl);
    }

    if (imageUrl || videoUrl) {
      this.localMediaByPostId.set(postId, {
        imageUrl,
        videoUrl
      });
    }

    this.groupImagePreviewUrls.delete(groupId);
    this.groupVideoPreviewUrls.delete(groupId);
    this.groupImageNames.delete(groupId);
    this.groupVideoNames.delete(groupId);
    this.groupMediaErrors.delete(groupId);
  }

  private applyLocalMedia(post: GroupPost): void {
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

  private revokeGroupImagePreview(groupId: number): void {
    const current = this.groupImagePreviewUrls.get(groupId);
    if (!current) {
      return;
    }

    URL.revokeObjectURL(current);
    this.groupImagePreviewUrls.delete(groupId);
  }

  private revokeGroupVideoPreview(groupId: number): void {
    const current = this.groupVideoPreviewUrls.get(groupId);
    if (!current) {
      return;
    }

    URL.revokeObjectURL(current);
    this.groupVideoPreviewUrls.delete(groupId);
  }

  private hydrateGroupPostAuthors(posts: GroupPost[]): void {
    const userIds = posts.map((post) => post.user_id);
    this.userDirectory.resolveUsers(userIds).subscribe({
      next: (users) => {
        posts.forEach((post) => {
          const display = users.get(post.user_id);
          if (!display) {
            return;
          }

          post.author_name = display.fullName;
          post.author_avatar = display.initials;
        });
      }
    });
  }

  private applyAdvancedFilters(groups: GroupView[]): GroupView[] {
    const query = this.searchTerm.trim().toLowerCase();
    const selectedGroupFilter = this.groupFilter;

    return groups.filter((group) => {
      const name = (group.name || '').toLowerCase();
      const description = (group.description || '').toLowerCase();
      const isMember = this.isGroupMember(group);

      if (query && !name.includes(query) && !description.includes(query)) {
        return false;
      }

      if (selectedGroupFilter === 'joined' && !isMember) {
        return false;
      }

      if (selectedGroupFilter === 'not-joined' && isMember) {
        return false;
      }

      return true;
    });
  }

  private sortGroupsByPopularity(groups: GroupView[]): GroupView[] {
    if (this.popularityFilter !== 'most-members') {
      return groups;
    }

    return [...groups].sort((left, right) => {
      const leftMembers = this.groupMembersCount(left);
      const rightMembers = this.groupMembersCount(right);

      if (leftMembers === rightMembers) {
        return this.createdAtTimestamp(right.created_at) - this.createdAtTimestamp(left.created_at);
      }

      return rightMembers - leftMembers;
    });
  }

  private hasAdvancedFilter(): boolean {
    return this.groupFilter !== 'all' || this.popularityFilter !== 'latest';
  }

  private rebuildVisibleGroups(): void {
    if (!this.useInfiniteScroll) {
      this.groups = this.orderGroupsForDisplay([...(this.pageCache.get(this.currentPage) ?? [])]);
      return;
    }

    const merged: GroupView[] = [];
    for (let page = 1; page <= this.currentPage; page += 1) {
      const items = this.pageCache.get(page);
      if (items?.length) {
        merged.push(...items);
      }
    }

    this.groups = this.orderGroupsForDisplay(merged);
  }

  private orderGroupsForDisplay(groups: GroupView[]): GroupView[] {
    if (this.popularityFilter === 'most-members') {
      return this.sortGroupsByPopularity(groups);
    }

    return this.sortGroupsForDisplay(groups);
  }

  private sortGroupsForDisplay(groups: GroupView[]): GroupView[] {
    return [...groups].sort((left, right) => {
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
    items: GroupView[],
    requestedPage: number,
    serverPageSize: number,
    serverCurrentPage: number
  ): GroupView[] {
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

  private resetAndReload(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.pageCache.clear();
    this.loadGroups(1, true);
    this.persistState();
  }

  private persistState(): void {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
      return;
    }

    sessionStorage.setItem(
      this.stateStorageKey,
      JSON.stringify({
        currentPage: this.currentPage,
        useInfiniteScroll: this.useInfiniteScroll,
        sortOrder: this.sortOrder,
        searchTerm: this.searchTerm,
        groupFilter: this.groupFilter,
        popularityFilter: this.popularityFilter,
        scrollY: window.scrollY
      })
    );
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
        groupFilter?: 'all' | 'joined' | 'not-joined';
        popularityFilter?: 'latest' | 'most-members';
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

      if (state.groupFilter === 'all' || state.groupFilter === 'joined' || state.groupFilter === 'not-joined') {
        this.groupFilter = state.groupFilter;
      }

      if (state.popularityFilter === 'latest' || state.popularityFilter === 'most-members') {
        this.popularityFilter = state.popularityFilter;
      }

      if (Number.isFinite(state.scrollY)) {
        setTimeout(() => {
          window.scrollTo({ top: state.scrollY as number, behavior: 'auto' });
        }, 50);
      }
    } catch {
      // Ignore malformed pagination state
    }
  }
}
