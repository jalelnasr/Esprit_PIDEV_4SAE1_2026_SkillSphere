export interface AdminMetricValue {
  current: number;
  previous: number;
  growthPercent: number;
}

export interface AdminCommunityStats {
  windowDays: number;
  generatedAt: string;
  posts: AdminMetricValue;
  questions: AdminMetricValue;
  groups: AdminMetricValue;
  activeUsers: AdminMetricValue;
}

export interface AdminActivityItem {
  type: string;
  title: string;
  description: string;
  userId: number | null;
  entityId: number | null;
  createdAt: string;
}

export interface AdminPostSummary {
  postId: number;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  userId: number;
  groupId: number | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface AdminPostLike {
  postLikeId: number;
  userId: number;
  createdAt: string;
}

export interface AdminPostComment {
  commentId: number;
  content: string;
  userId: number;
  createdAt: string;
  likesCount: number;
}

export interface AdminPostDetail {
  post: AdminPostSummary;
  likes: AdminPostLike[];
  comments: AdminPostComment[];
}

export interface AdminPostListResponse {
  posts: AdminPostSummary[];
  total: number;
  page: number;
  size: number;
}

export type AdminQuestionStatus = 'open' | 'closed';

export interface AdminQuestionSummary {
  questionId: number;
  title: string;
  description: string;
  createdAt: string;
  userId: number;
  status: AdminQuestionStatus;
}

export interface AdminGroupSummary {
  groupId: number;
  name: string;
  description: string;
  createdAt: string;
  createdBy: number;
  membersCount: number;
}

export interface AdminFollowSummary {
  followId: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}
