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

export interface ApprenantChoiceResponse {
  id: number;
  label: string;
}

export interface ApprenantQuestionResponse {
  id: number;
  text: string;
  points: number;
  choices: ApprenantChoiceResponse[];
}

export interface ApprenantQuizResponse {
  id: number;
  evaluationId: number;
  questions: ApprenantQuestionResponse[];
}

export interface ApprenantQuizSubmissionAnswer {
  questionId: number;
  choiceId: number;
}

export interface ApprenantQuizSubmissionRequest {
  answers: ApprenantQuizSubmissionAnswer[];
}

export interface ApprenantQuizSubmissionResult {
  quizId: number;
  score: number;
  currentAttemptScore?: number;
  passingScore: number;
  passed: boolean;
  improved?: boolean;
  alreadyPassed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class QuizApiService {
  // ✅ only one /api
  private formateurBaseUrl = `${environment.evaluationApiBaseUrl}/api/formateur/quizzes`;
  private apprenantBaseUrl = `${environment.evaluationApiBaseUrl}/api/apprenant/quizzes`;

  constructor(private http: HttpClient) {
    console.log('✅ QuizApiService initialized');
    console.log('   Formateur Base URL:', this.formateurBaseUrl);
    console.log('   Apprenant Base URL:', this.apprenantBaseUrl);
  }

  /**
   * Get all quizzes for a specific formateur
   */
  getQuizzesByFormateur(formateurId: number): Observable<QuizResponse[]> {
    console.log('📥 Getting quizzes for formateurId:', formateurId);
    const url = `${this.formateurBaseUrl}/formateur/${formateurId}`;
    console.log('   Endpoint:', url);
    return this.http.get<QuizResponse[]>(url);
  }

  getAvailableQuizzesForApprenant(): Observable<ApprenantQuizResponse[]> {
    console.log('📥 Getting all available quizzes for apprenant');
    return this.http.get<ApprenantQuizResponse[]>(this.apprenantBaseUrl);
  }

  createQuiz(evaluationId: number, passingScore: number) {
    console.log('📝 Creating quiz for evaluationId:', evaluationId, 'passingScore:', passingScore);
    return this.http.post<QuizResponse>(
      `${this.formateurBaseUrl}/${evaluationId}`,
      { passingScore }   // doit matcher CreateQuizRequest
    );
  }

  addQuestion(quizId: number, text: string, points: number) {
    console.log('📝 Adding question to quizId:', quizId);
    return this.http.post<QuestionResponse>(
      `${this.formateurBaseUrl}/${quizId}/questions`,
      { text, points }
    );
  }

  addChoice(questionId: number, label: string, isCorrect: boolean) {
    console.log('📝 Adding choice to questionId:', questionId);
    return this.http.post<ChoiceResponse>(
      `${this.formateurBaseUrl}/questions/${questionId}/choices`,
      { label, isCorrect }
    );
  }

  getQuiz(quizId: number) {
    console.log('📥 Getting quiz:', quizId);
    const url = `${this.formateurBaseUrl}/${quizId}`;
    console.log('   Endpoint:', url);
    return this.http.get<QuizResponse>(url);
  }

  getQuizForApprenant(quizId: number): Observable<ApprenantQuizResponse> {
    console.log('📥 Getting available quiz for apprenant:', quizId);
    const url = `${this.apprenantBaseUrl}/${quizId}`;
    console.log('   Endpoint:', url);
    return this.http.get<ApprenantQuizResponse>(url);
  }

  submitQuizForApprenant(
    quizId: number,
    request: ApprenantQuizSubmissionRequest
  ): Observable<ApprenantQuizSubmissionResult> {
    const url = `${this.apprenantBaseUrl}/${quizId}/submit`;
    console.log('📝 Submitting quiz for apprenant:', quizId);
    console.log('   Endpoint:', url);
    return this.http.post<ApprenantQuizSubmissionResult>(url, request);
  }
}
