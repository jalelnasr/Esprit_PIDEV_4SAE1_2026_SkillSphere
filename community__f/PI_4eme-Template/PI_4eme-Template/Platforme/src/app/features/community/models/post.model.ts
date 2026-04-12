import { Comment } from './comment.model';

export interface Post {
  id: number;
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  group_id?: number | null;
  user_id: number;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  author_name?: string;
  author_avatar?: string;
  comments?: Comment[];
}

export interface CreatePostRequest {
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  group_id: number | null;
}

export interface UpdatePostRequest {
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  group_id?: number | null;
}

export interface LikePostRequest {
  post_id: number;
}
