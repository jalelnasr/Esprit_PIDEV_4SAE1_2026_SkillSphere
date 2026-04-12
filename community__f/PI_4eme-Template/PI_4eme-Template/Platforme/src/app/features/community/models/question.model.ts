import { Answer } from './answer.model';

export interface Question {
  id: number;
  title: string;
  description: string;
  user_id: number;
  created_at: string;
  views_count?: number;
  answers_count?: number;
  author_name?: string;
  author_avatar?: string;
  answers?: Answer[];
}

export interface CreateQuestionRequest {
  title: string;
  description: string;
}

export interface UpdateQuestionRequest {
  title: string;
  description: string;
}
