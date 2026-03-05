import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface LessonRequest {
  title: string;
  description?: string;
  orderIndex: number;
  durationMinutes?: number;
}

export interface LessonResourceRequest {
  title: string;
  type: 'VIDEO' | 'PDF';
  url: string;
  durationMinutes?: number;
  fileSizeBytes?: number;
}

export interface LessonResourceResponse {
  id: number;
  title: string;
  type: 'VIDEO' | 'PDF';
  url: string;
  durationMinutes?: number;
  fileSizeBytes?: number;
  lessonId: number;
}

export interface LessonResponse {
  id: number;
  title: string;
  description?: string;
  orderIndex: number;
  durationMinutes?: number;
  courseId: number;
  resources?: LessonResourceResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class ContentManagementService {
  private apiUrl = environment.formationApi ? `${environment.formationApi}/formation` : `${environment.apiUrl}/formation-service/api/formation`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap(user => {
        const userId = user?.idUser?.toString() || '';
        const userRole = user?.role || '';
        
        console.log('🔑 Content Management Headers:', { userId, userRole });
        
        const headers = new HttpHeaders({
          'X-User-Id': userId,
          'X-User-Role': userRole
        });
        
        return new Observable<HttpHeaders>(observer => {
          observer.next(headers);
          observer.complete();
        });
      })
    );
  }

  // Lesson (Chapter) Management
  createLesson(courseId: number, request: LessonRequest): Observable<LessonResponse> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.post<LessonResponse>(
          `${this.apiUrl}/courses/${courseId}/lessons`,
          request,
          { headers }
        )
      )
    );
  }

  getLessons(courseId: number): Observable<LessonResponse[]> {
    return this.http.get<LessonResponse[]>(
      `${this.apiUrl}/courses/${courseId}/lessons`
    );
  }

  getLesson(lessonId: number): Observable<LessonResponse> {
    return this.http.get<LessonResponse>(
      `${this.apiUrl}/lessons/${lessonId}`
    );
  }

  updateLesson(lessonId: number, request: LessonRequest): Observable<LessonResponse> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.put<LessonResponse>(
          `${this.apiUrl}/lessons/${lessonId}`,
          request,
          { headers }
        )
      )
    );
  }

  deleteLesson(lessonId: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.delete<void>(
          `${this.apiUrl}/lessons/${lessonId}`,
          { headers }
        )
      )
    );
  }

  reorderLessons(courseId: number, lessonIds: number[]): Observable<void> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.put<void>(
          `${this.apiUrl}/courses/${courseId}/lessons/reorder`,
          lessonIds,
          { headers }
        )
      )
    );
  }

  // Resource Management
  addVideoResource(lessonId: number, request: LessonResourceRequest): Observable<LessonResourceResponse> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<LessonResourceResponse>(
          `${this.apiUrl}/lessons/${lessonId}/resources/video`,
          request,
          { headers }
        )
      )
    );
  }

  addPdfResource(lessonId: number, request: LessonResourceRequest): Observable<LessonResourceResponse> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<LessonResourceResponse>(
          `${this.apiUrl}/lessons/${lessonId}/resources/pdf`,
          request,
          { headers }
        )
      )
    );
  }

  getLessonResources(lessonId: number): Observable<LessonResourceResponse[]> {
    return this.http.get<LessonResourceResponse[]>(
      `${this.apiUrl}/lessons/${lessonId}/resources`
    );
  }

  updateResource(resourceId: number, request: LessonResourceRequest): Observable<LessonResourceResponse> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.put<LessonResourceResponse>(
          `${this.apiUrl}/resources/${resourceId}`,
          request,
          { headers }
        )
      )
    );
  }

  deleteResource(resourceId: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.delete<void>(
          `${this.apiUrl}/resources/${resourceId}`,
          { headers }
        )
      )
    );
  }

  // File Upload Methods
  uploadVideo(file: File): Observable<{url: string, filename: string, size: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadUrl = environment.formationApi 
      ? `${environment.formationApi}/uploads/video`
      : `${environment.apiUrl}/formation-service/api/uploads/video`;
    
    return this.http.post<{url: string, filename: string, size: string}>(uploadUrl, formData);
  }

  uploadPdf(file: File): Observable<{url: string, filename: string, size: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadUrl = environment.formationApi 
      ? `${environment.formationApi}/uploads/pdf`
      : `${environment.apiUrl}/formation-service/api/uploads/pdf`;
    
    return this.http.post<{url: string, filename: string, size: string}>(uploadUrl, formData);
  }
}
