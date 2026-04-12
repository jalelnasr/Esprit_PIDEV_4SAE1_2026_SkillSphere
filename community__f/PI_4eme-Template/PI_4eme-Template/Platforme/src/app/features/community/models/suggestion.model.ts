export interface SuggestedUser {
  user_id: number;
  display_name: string;
  score: number;
  shared_groups: number;
  shared_hashtags: number;
  shared_interactions: number;
  same_domain: boolean;
}

export interface SuggestedGroup {
  id: number;
  name: string;
  description: string;
  score: number;
  matched_hashtags: number;
  overlap_members: number;
  recent_activity: number;
  members_count: number;
  trending: boolean;
  popular: boolean;
}
