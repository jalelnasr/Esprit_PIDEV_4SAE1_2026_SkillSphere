import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, catchError, finalize, forkJoin, map, of, switchMap, timer } from 'rxjs';
import { AdminGroupSummary } from './admin-community.model';
import { AdminCommunityService } from './admin-community.service';
import { CommunityUserDirectoryService } from '../../features/community/services/community-user-directory.service';

interface AdminGroupView extends AdminGroupSummary {
  creatorName: string;
  creatorInitials: string;
}

@Component({
  selector: 'app-admin-groups',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-groups.component.html',
  styleUrls: ['./admin-groups.component.css']
})
export class AdminGroupsComponent implements OnInit, OnDestroy {
  groups: AdminGroupView[] = [];
  selectedGroup: AdminGroupView | null = null;

  isLoading = true;
  errorMessage = '';

  private autoRefreshSub?: Subscription;
  private readonly refreshIntervalMs = 15000;
  private silentRefreshInFlight = false;

  constructor(
    private readonly adminCommunityService: AdminCommunityService,
    private readonly userDirectory: CommunityUserDirectoryService
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
  }

  loadGroups(silent = false): void {
    if (silent && this.silentRefreshInFlight) {
      return;
    }

    if (!silent) {
      this.isLoading = true;
      this.errorMessage = '';
    } else {
      this.silentRefreshInFlight = true;
    }

    const selectedGroupId = this.selectedGroup?.groupId ?? null;

    this.adminCommunityService
      .getGroups()
      .pipe(
        switchMap((groups) => this.resolveGroupMemberCounts(groups)),
        switchMap((groups) =>
          this.userDirectory.resolveUsers(groups.map((group) => group.createdBy)).pipe(
            map((users) =>
              groups.map((group) => {
                const display = users.get(group.createdBy);
                const creatorName = display?.fullName ?? `User #${group.createdBy}`;

                return {
                  ...group,
                  creatorName,
                  creatorInitials: display?.initials ?? this.initials(creatorName, group.createdBy)
                };
              })
            )
          )
        ),
        catchError((error: Error) => {
          this.errorMessage = error.message;
          return of([] as AdminGroupView[]);
        }),
        finalize(() => {
          if (!silent) {
            this.isLoading = false;
          }
          this.silentRefreshInFlight = false;
        })
      )
      .subscribe((groups) => {
        this.groups = groups;

        if (selectedGroupId === null) {
          return;
        }

        this.selectedGroup = groups.find((group) => group.groupId === selectedGroupId) ?? null;
      });
  }

  selectGroup(group: AdminGroupView): void {
    this.selectedGroup = group;
  }

  closeDetail(): void {
    this.selectedGroup = null;
  }

  getFilteredGroups(): AdminGroupView[] {
    return this.groups;
  }

  private startAutoRefresh(): void {
    this.autoRefreshSub = timer(this.refreshIntervalMs, this.refreshIntervalMs).subscribe(() => {
      this.loadGroups(true);
    });
  }

  private resolveGroupMemberCounts(groups: AdminGroupSummary[]) {
    if (groups.length === 0) {
      return of([] as AdminGroupSummary[]);
    }

    return forkJoin(
      groups.map((group) => {
        if (group.membersCount > 0) {
          return of(group);
        }

        return this.adminCommunityService.getGroupMembersCount(group.groupId).pipe(
          map((membersCount) => ({
            ...group,
            membersCount
          })),
          catchError(() => of(group))
        );
      })
    );
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
