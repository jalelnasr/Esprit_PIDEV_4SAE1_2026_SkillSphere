export interface Notification {
  idNotification: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  competitionId?: number;
  relatedId?: number;
}

export type NotificationType = 
  | 'NEW_MESSAGE'
  | 'RANKING_CHANGE'
  | 'COMPETITION_START'
  | 'COMPETITION_END'
  | 'TEAM_ASSIGNED'
  | 'ANNOUNCEMENT'
  | 'WINNER_ANNOUNCED';

export interface NotificationCount {
  count: number;
}
