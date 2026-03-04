export type VoteType = 'UP' | 'DOWN';

export interface Answer {
  id: number;
  content: string;
  question_id: number;
  user_id: number;
  created_at: string;
  upvotes?: number;
  downvotes?: number;
  user_vote?: VoteType | null;
  author_name?: string;
  author_avatar?: string;
}

export interface CreateAnswerRequest {
  content: string;
  question_id: number;
}

export interface VoteAnswerRequest {
  answer_id: number;
  vote_type: VoteType;
}
