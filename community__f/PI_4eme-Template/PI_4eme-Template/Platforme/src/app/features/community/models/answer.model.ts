export type VoteType = 'UP' | 'DOWN';

export interface GitHubRepoPreview {
  repo_name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  status: 'OK' | 'INVALID_URL' | 'NOT_FOUND' | 'RATE_LIMITED' | 'ERROR';
  message?: string;
}

export interface Answer {
  id: number;
  content: string;
  question_id: number;
  user_id: number;
  created_at: string;
  github_previews?: GitHubRepoPreview[];
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
