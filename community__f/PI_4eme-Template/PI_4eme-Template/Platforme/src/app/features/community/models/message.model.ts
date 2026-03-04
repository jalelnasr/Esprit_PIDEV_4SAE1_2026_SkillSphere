export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read?: boolean;
  sender_name?: string;
  sender_avatar?: string;
  receiver_name?: string;
  receiver_avatar?: string;
}

export interface SendMessageRequest {
  content: string;
  receiver_id: number;
}

export interface Conversation {
  other_user_id: number;
  other_user_name?: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  messages?: Message[];
}
