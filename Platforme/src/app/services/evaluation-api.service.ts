import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { CertificateStatus } from './certificate-api.service';

export interface QuizSummary {
  id: number;
  passingScore: number;
}

export interface Evaluation {
  id: number;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED';
  formateurId?: number;
  bestScore?: number | null;
  passed?: boolean;
  attempted?: boolean;
  certificateStatus?: CertificateStatus;
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

  private formateurBaseUrl = `${environment.evaluationApiBaseUrl}/api/formateur/evaluations`;
  private apprenantBaseUrl = `${environment.evaluationApiBaseUrl}/api/apprenant/evaluations`;

  constructor(private http: HttpClient) {
    console.log('✅ EvaluationApiService initialized');
    console.log('   Formateur Base URL:', this.formateurBaseUrl);
    console.log('   Apprenant Base URL:', this.apprenantBaseUrl);
  }

  create(req: EvaluationCreateRequest): Observable<Evaluation> {
    console.log('📝 Creating evaluation:', req);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('TOKEN =', token);
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<Evaluation>(this.formateurBaseUrl, req, options);
  }

  getById(id: number): Observable<Evaluation> {
    console.log('📥 Getting evaluation by ID:', id);
    return this.http.get<Evaluation>(`${this.formateurBaseUrl}/${id}`);
  }

  getByFormateur(formateurId: number): Observable<Evaluation[]> {
    console.log('📥 Getting evaluations for formateurId:', formateurId);
    const url = `${this.formateurBaseUrl}/formateur/${formateurId}`;
    console.log('   Endpoint:', url);
    return this.http.get<Evaluation[]>(url);
  }

  getPublishedForApprenant(): Observable<Evaluation[]> {
    console.log('📥 Getting all published evaluations for apprenant');
    return this.http.get<Evaluation[]>(this.apprenantBaseUrl);
  }

  searchEvaluations(formateurId: number, title: string): Observable<Evaluation[]> {
    console.log('🔍 Searching evaluations for formateurId:', formateurId, 'title:', title);
    const url = `${this.formateurBaseUrl}/formateur/${formateurId}/search?title=${encodeURIComponent(title)}`;
    console.log('   Search endpoint:', url);
    return this.http.get<Evaluation[]>(url);
  }

  update(id: number, req: EvaluationUpdateRequest): Observable<Evaluation> {
    console.log('✏️ Updating evaluation:', id, req);
    return this.http.put<Evaluation>(`${this.formateurBaseUrl}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    console.log('🗑️ Deleting evaluation:', id);
    return this.http.delete<void>(`${this.formateurBaseUrl}/${id}`);
  }

  publish(id: number): Observable<Evaluation> {
    console.log('📤 Publishing evaluation:', id);
    const url = `${this.formateurBaseUrl}/${id}/publish`;
    return this.http.post<Evaluation>(url, {}).pipe(
      catchError((err) => {
        if (err?.status === 405) {
          console.warn('POST publish not allowed, retrying with PUT:', url);
          return this.http.put<Evaluation>(url, {});
        }
        return throwError(() => err);
      })
    );
  }

}
