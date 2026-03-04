export interface Comment {
  id: number;
  content: string;
  post_id: number;
  user_id: number;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
  author_name?: string;
  author_avatar?: string;
}

export interface CreateCommentRequest {
  content: string;
  post_id: number;
}

export interface LikeCommentRequest {
  comment_id: number;
}
