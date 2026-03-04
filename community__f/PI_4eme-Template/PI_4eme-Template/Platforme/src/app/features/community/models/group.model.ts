import { Post } from './post.model';

export interface Group {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  members_count?: number;
  is_member?: boolean;
  posts?: Post[];
}

export interface CreateGroupRequest {
  name: string;
  description: string;
}

export interface JoinGroupRequest {
  group_id: number;
}
