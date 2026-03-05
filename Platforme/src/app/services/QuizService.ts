import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface QuizResponse {
  id: number;
  passingScore: number;
  evaluationId: number;
  questions: QuestionResponse[];
}
export interface QuestionResponse {
  id: number;
  text: string;
  points: number;
  choices: ChoiceResponse[];
}
export interface ChoiceResponse {
  id: number;
  label: string;
  isCorrect: boolean;
}

@Injectable({ providedIn: 'root' })
export class QuizApiService {
  // ✅ only one /api
  private baseUrl = `${environment.apiBaseUrl}/api/formateur/quizzes`;

  constructor(private http: HttpClient) {}


createQuiz(evaluationId: number, passingScore: number) {
  return this.http.post<QuizResponse>(
    `${this.baseUrl}/${evaluationId}`,
    { passingScore }   // doit matcher CreateQuizRequest
  );
}

  addQuestion(quizId: number, text: string, points: number) {
    return this.http.post<QuestionResponse>(
      `${this.baseUrl}/${quizId}/questions`,
      { text, points }
    );
  }

  addChoice(questionId: number, label: string, isCorrect: boolean) {
    return this.http.post<ChoiceResponse>(
      `${this.baseUrl}/questions/${questionId}/choices`,
      { label, isCorrect }
    );
  }

  getQuiz(quizId: number) {
    return this.http.get<QuizResponse>(`${this.baseUrl}/${quizId}`);
  }
}