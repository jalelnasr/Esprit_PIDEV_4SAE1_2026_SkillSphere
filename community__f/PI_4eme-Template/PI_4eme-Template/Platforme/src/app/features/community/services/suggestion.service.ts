import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { CommunityBaseService } from './community-base.service';
import { SuggestedGroup, SuggestedUser } from '../models/suggestion.model';

interface BackendSuggestedUser {
  userId: number;
  displayName: string;
  score: number;
  sharedGroups: number;
  sharedHashtags: number;
  sharedInteractions: number;
  sameDomain: boolean;
}

interface BackendSuggestedGroup {
  groupId: number;
  name: string;
  description: string;
  score: number;
  matchedHashtags: number;
  overlapMembers: number;
  recentActivity: number;
  membersCount: number;
  trending: boolean;
  popular: boolean;
}

@Injectable({ providedIn: 'root' })
export class SuggestionService extends CommunityBaseService {
  constructor(private readonly http: HttpClient) {
    super();
  }

  getSuggestedUsers(limit = 10): Observable<SuggestedUser[]> {
    return this.http
      .get<BackendSuggestedUser[] | { data?: BackendSuggestedUser[]; items?: BackendSuggestedUser[]; content?: BackendSuggestedUser[] }>(
        `${this.communityBaseUrl}/suggestions/users`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendSuggestedUser>(response).map((item) => this.mapSuggestedUser(item)).slice(0, limit)),
        catchError(this.handleError('Get suggested users'))
      );
  }

  getSuggestedGroups(limit = 10): Observable<SuggestedGroup[]> {
    return this.http
      .get<BackendSuggestedGroup[] | { data?: BackendSuggestedGroup[]; items?: BackendSuggestedGroup[]; content?: BackendSuggestedGroup[] }>(
        `${this.communityBaseUrl}/suggestions/groups`,
        this.authOptions()
      )
      .pipe(
        map((response) => this.extractList<BackendSuggestedGroup>(response).map((item) => this.mapSuggestedGroup(item)).slice(0, limit)),
        catchError(this.handleError('Get suggested groups'))
      );
  }

  private mapSuggestedUser(item: BackendSuggestedUser): SuggestedUser {
    return {
      user_id: item.userId,
      display_name: item.displayName,
      score: item.score,
      shared_groups: item.sharedGroups,
      shared_hashtags: item.sharedHashtags,
      shared_interactions: item.sharedInteractions,
      same_domain: Boolean(item.sameDomain)
    };
  }

  private mapSuggestedGroup(item: BackendSuggestedGroup): SuggestedGroup {
    return {
      id: item.groupId,
      name: item.name,
      description: item.description,
      score: item.score,
      matched_hashtags: item.matchedHashtags,
      overlap_members: item.overlapMembers,
      recent_activity: item.recentActivity,
      members_count: item.membersCount,
      trending: Boolean(item.trending),
      popular: Boolean(item.popular)
    };
  }
}
