export type CommunityNotificationType = 'like' | 'follow' | 'message';

export interface CommunityNotification {
  id: string;
  type: CommunityNotificationType;
  text: string;
  relatedUserId: number | null;
  postId?: number | null;
  messageId?: number | null;
  createdAt: string;
  read: boolean;
}

export interface CommunityNotificationRoute {
  commands: Array<string | number>;
  queryParams?: Record<string, string | number>;
}
