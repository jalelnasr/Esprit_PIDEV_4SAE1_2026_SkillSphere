import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, catchError, finalize, map, of, switchMap, timer } from 'rxjs';
import { AdminUsersApiService } from '../admin-users-api.service';
import { AdminFollowSummary } from './admin-community.model';
import { AdminCommunityService } from './admin-community.service';
import {
  CommunityUserDirectoryService,
  CommunityUserDisplay
} from '../../features/community/services/community-user-directory.service';

interface AdminFollowView extends AdminFollowSummary {
  followerName: string;
  followerInitials: string;
  followingName: string;
  followingInitials: string;
}

@Component({
  selector: 'app-admin-follows',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-follows.component.html',
  styleUrls: ['./admin-follows.component.css']
})
export class AdminFollowsComponent implements OnInit, OnDestroy {
  follows: AdminFollowView[] = [];
  selectedFollow: AdminFollowView | null = null;

  isLoading = true;
  errorMessage = '';

  private autoRefreshSub?: Subscription;
  private readonly refreshIntervalMs = 15000;
  private silentRefreshInFlight = false;

  constructor(
    private readonly adminCommunityService: AdminCommunityService,
    private readonly adminUsersApiService: AdminUsersApiService,
    private readonly userDirectory: CommunityUserDirectoryService
  ) {}

  ngOnInit(): void {
    this.loadFollows();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
  }

  loadFollows(silent = false): void {
    if (silent && this.silentRefreshInFlight) {
      return;
    }

    if (!silent) {
      this.isLoading = true;
      this.errorMessage = '';
    } else {
      this.silentRefreshInFlight = true;
    }

    const selectedKey = this.selectedFollow ? this.followKey(this.selectedFollow) : null;

    this.adminUsersApiService
      .list()
      .pipe(
        switchMap((users) => {
          const namesById = new Map<number, string>();
          users.forEach((user) => {
            const fullName = `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || `User #${user.idUser}`;
            namesById.set(user.idUser, fullName);
          });

          return this.adminCommunityService.getAllFollows(users.map((user) => user.idUser)).pipe(
            switchMap((follows) => {
              const missingIds = new Set<number>();
              follows.forEach((follow) => {
                if (follow.followerId > 0 && !namesById.has(follow.followerId)) {
                  missingIds.add(follow.followerId);
                }
                if (follow.followingId > 0 && !namesById.has(follow.followingId)) {
                  missingIds.add(follow.followingId);
                }
              });

              if (missingIds.size === 0) {
                return of(this.mapFollows(follows, namesById, new Map<number, CommunityUserDisplay>()));
              }

              return this.userDirectory.resolveUsers(Array.from(missingIds)).pipe(
                map((resolvedUsers) => this.mapFollows(follows, namesById, resolvedUsers)),
                catchError(() => of(this.mapFollows(follows, namesById, new Map<number, CommunityUserDisplay>())))
              );
            })
          );
        }),
        catchError((error: Error) => {
          this.errorMessage = error.message;
          return of([] as AdminFollowView[]);
        }),
        finalize(() => {
          if (!silent) {
            this.isLoading = false;
          }
          this.silentRefreshInFlight = false;
        })
      )
      .subscribe((follows) => {
        this.follows = follows;
        if (selectedKey) {
          this.selectedFollow = follows.find((follow) => this.followKey(follow) === selectedKey) ?? null;
        }
      });
  }

  selectFollow(follow: AdminFollowView): void {
    this.selectedFollow = follow;
  }

  closeDetail(): void {
    this.selectedFollow = null;
  }

  getFollowStats(): { totalFollows: number; uniqueFollowers: number; uniqueFollowing: number } {
    const totalFollows = this.follows.length;
    const uniqueFollowers = new Set(this.follows.map((follow) => follow.followerId)).size;
    const uniqueFollowing = new Set(this.follows.map((follow) => follow.followingId)).size;

    return { totalFollows, uniqueFollowers, uniqueFollowing };
  }

  private startAutoRefresh(): void {
    this.autoRefreshSub = timer(this.refreshIntervalMs, this.refreshIntervalMs).subscribe(() => {
      this.loadFollows(true);
    });
  }

  private mapFollows(
    follows: AdminFollowSummary[],
    namesById: Map<number, string>,
    resolvedUsers: Map<number, CommunityUserDisplay>
  ): AdminFollowView[] {
    return follows.map((follow) => {
      const followerName =
        namesById.get(follow.followerId) ?? resolvedUsers.get(follow.followerId)?.fullName ?? `User #${follow.followerId}`;
      const followingName =
        namesById.get(follow.followingId) ??
        resolvedUsers.get(follow.followingId)?.fullName ??
        `User #${follow.followingId}`;

      return {
        ...follow,
        followerName,
        followerInitials: this.initials(followerName, follow.followerId),
        followingName,
        followingInitials: this.initials(followingName, follow.followingId)
      };
    });
  }

  private followKey(follow: AdminFollowSummary): string {
    return follow.followId > 0 ? `id:${follow.followId}` : `pair:${follow.followerId}:${follow.followingId}`;
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
