import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface QuizOption {
  id: number;
  text: string;
  orderIndex: number;
  isCorrect?: boolean | null; // null for students
}

export interface QuizQuestion {
  id: number;
  text: string;
  orderIndex: number;
  options: QuizOption[];
}

export interface QuizData {
  id: number;
  lessonId: number;
  title: string;
  passThreshold: number;
  isBlocking: boolean;
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  enrollmentId: number;
  answers: { questionId: number; chosenOptionId: number }[];
}

export interface QuestionResult {
  questionId: number;
  questionText: string;
  chosenOptionId: number;
  correctOptionId: number;
  correct: boolean;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  passThreshold: number;
  correctCount: number;
  totalQuestions: number;
  results: QuestionResult[];
}

export interface QuizStats {
  averageScore: number;
  totalAttempts: number;
  passedCount: number;
  passRate: number;
}

export interface WeakQuestion {
  questionId: number;
  questionText: string;
  wrongCount: number;
  totalAnswered: number;
  wrongPercent: number;
}

export interface QuizAnalyticsResponse {
  quizId: number;
  quizTitle: string;
  lessonTitle: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  passedCount: number;
  weakestQuestions: WeakQuestion[];
}

export interface StudentQuizSummary {
  quizId: number;
  quizTitle: string;
  lessonId: number;
  lessonTitle: string;
  courseId: number;
  courseTitle: string;
  bestScore: number | null;
  totalQuestions: number;
  passThreshold: number;
  passed: boolean | null;
  status: 'PASSED' | 'FAILED' | 'NOT_TAKEN';
  attemptCount: number;
  lastAttemptAt: string | null;
}

export interface QuizRequest {
  title: string;
  passThreshold: number;
  isBlocking: boolean;
  questions: {
    text: string;
    orderIndex: number;
    options: { text: string; isCorrect: boolean; orderIndex: number }[];
  }[];
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly BASE = 'http://localhost:8080/formation-service/api/formation';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-User-Id': String(user?.idUser ?? ''),
      'X-User-Role': user?.role ?? ''
    });
  }

  hasQuiz(lessonId: number): Observable<{ hasQuiz: boolean }> {
    return this.http.get<{ hasQuiz: boolean }>(
      `${this.BASE}/lessons/${lessonId}/quiz/exists`,
      { headers: this.headers() }
    );
  }

  getQuiz(lessonId: number): Observable<QuizData> {
    return this.http.get<QuizData>(
      `${this.BASE}/lessons/${lessonId}/quiz`,
      { headers: this.headers() }
    );
  }

  createQuiz(lessonId: number, request: QuizRequest): Observable<QuizData> {
    return this.http.post<QuizData>(
      `${this.BASE}/lessons/${lessonId}/quiz`,
      request,
      { headers: this.headers() }
    );
  }

  updateQuiz(quizId: number, request: QuizRequest): Observable<QuizData> {
    return this.http.put<QuizData>(
      `${this.BASE}/quizzes/${quizId}`,
      request,
      { headers: this.headers() }
    );
  }

  deleteQuiz(quizId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.BASE}/quizzes/${quizId}`,
      { headers: this.headers() }
    );
  }

  submitQuiz(quizId: number, submission: QuizSubmission): Observable<QuizResult> {
    return this.http.post<QuizResult>(
      `${this.BASE}/quizzes/${quizId}/submit`,
      submission,
      { headers: this.headers() }
    );
  }

  getMyAttempt(quizId: number): Observable<{ score: number; passed: boolean; attemptedAt: string }> {
    return this.http.get<any>(
      `${this.BASE}/quizzes/${quizId}/my-attempt`,
      { headers: this.headers() }
    );
  }

  getStats(quizId: number): Observable<QuizStats> {
    return this.http.get<QuizStats>(
      `${this.BASE}/quizzes/${quizId}/stats`,
      { headers: this.headers() }
    );
  }

  getAnalytics(quizId: number): Observable<QuizAnalyticsResponse> {
    return this.http.get<QuizAnalyticsResponse>(
      `${this.BASE}/quizzes/${quizId}/analytics`,
      { headers: this.headers() }
    );
  }

  getMyQuizSummary(): Observable<StudentQuizSummary[]> {
    return this.http.get<StudentQuizSummary[]>(
      `${this.BASE}/quizzes/my-summary`,
      { headers: this.headers() }
    );
  }
}
