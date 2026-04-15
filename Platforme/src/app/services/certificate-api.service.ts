import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type CertificateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CertificateResponse {
  id: number;
  apprenantId: number;
  apprenantFirstName: string;
  apprenantLastName: string;
  evaluationId: number;
  evaluationTitle: string;
  formateurId: number;
  bestScore: number;
  passed: boolean;
  status: CertificateStatus;
  note?: string;
  requestedAt: string;
  issuedAt?: string;
  pdfFileName?: string;
}

export interface AttemptHistoryItem {
  score: number;
  passed: boolean;
  submittedAt?: string;
}

export interface CertificateRequestDetail extends CertificateResponse {
  attemptHistory: AttemptHistoryItem[];
}

export interface RequestCertificatePayload {
  evaluationId: number;
  apprenantFirstName: string;
  apprenantLastName: string;
}

@Injectable({ providedIn: 'root' })
export class CertificateApiService {
  private apprenantBaseUrl = `${environment.evaluationApiBaseUrl}/api/apprenant/certificates`;
  private formateurBaseUrl = `${environment.evaluationApiBaseUrl}/api/formateur/certificates`;

  constructor(private http: HttpClient) {}

  requestCertificate(payload: RequestCertificatePayload): Observable<CertificateResponse> {
    return this.http.post<CertificateResponse>(`${this.apprenantBaseUrl}/request`, payload);
  }

  getMyCertificates(): Observable<CertificateResponse[]> {
    return this.http.get<CertificateResponse[]>(this.apprenantBaseUrl);
  }

  downloadMyCertificate(id: number): Observable<Blob> {
    return this.http.get(`${this.apprenantBaseUrl}/${id}/download`, { responseType: 'blob' });
  }

  getFormateurRequests(status?: CertificateStatus): Observable<CertificateRequestDetail[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<CertificateRequestDetail[]>(`${this.formateurBaseUrl}/requests`, { params });
  }

  approveRequest(id: number, note?: string): Observable<CertificateResponse> {
    return this.http.post<CertificateResponse>(`${this.formateurBaseUrl}/${id}/approve`, { note: note || '' });
  }

  rejectRequest(id: number, note?: string): Observable<CertificateResponse> {
    return this.http.post<CertificateResponse>(`${this.formateurBaseUrl}/${id}/reject`, { note: note || '' });
  }

  downloadForFormateur(id: number): Observable<Blob> {
    return this.http.get(`${this.formateurBaseUrl}/${id}/download`, { responseType: 'blob' });
  }
}
