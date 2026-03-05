import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QuizSummary {
  id: number;
  passingScore: number;
}

export interface Evaluation {
  id: number;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED';
  formateurId: number;
  quiz?: QuizSummary | null;
}

export interface EvaluationCreateRequest {
  title: string;
  description: string;
  formateurId: number;
}

export interface EvaluationUpdateRequest {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationApiService {

  private baseUrl = `${environment.apiBaseUrl}/api/formateur/evaluations`;

  constructor(private http: HttpClient) {}

  create(req: EvaluationCreateRequest): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.baseUrl, req);
  }

  getById(id: number): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.baseUrl}/${id}`);
  }

  getByFormateur(formateurId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/formateur/${formateurId}`);
  }

  update(id: number, req: EvaluationUpdateRequest): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.baseUrl}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  publish(id: number): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${this.baseUrl}/${id}/publish`, {});
  }

}
