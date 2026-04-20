import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type BackendRole = 'ADMIN' | 'FORMATEUR' | 'APPRENANT' | 'RH_ENTREPRISE';

export interface UserResponse {
  idUser: number;
  nom: string;
  prenom: string;
  email: string;
  role: BackendRole;
  phone?: string | null;
  adresse?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
}

export interface AdminCreateUserRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: BackendRole;
  phone?: string | null;
  adresse?: string | null;
  isActive?: boolean | null;
}

export interface AdminUpdateUserRequest {
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  phone?: string | null;
  adresse?: string | null;
}

export interface AdminResetPasswordRequest {
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersApiService {
  private readonly base = `${environment.apiUrl}/users/admin`;

  constructor(private http: HttpClient) {}

  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.base);
  }

  create(req: AdminCreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.base, req);
  }

  update(idUser: number, req: AdminUpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.base}/${idUser}`, req);
  }

  setRole(idUser: number, role: BackendRole): Observable<UserResponse> {
    const params = new HttpParams().set('role', role);
    return this.http.put<UserResponse>(`${this.base}/${idUser}/role`, null, { params });
  }

  setActive(idUser: number, active: boolean): Observable<UserResponse> {
    const params = new HttpParams().set('active', String(active));
    return this.http.put<UserResponse>(`${this.base}/${idUser}/active`, null, { params });
  }

  resetPassword(idUser: number, req: AdminResetPasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${idUser}/password`, req);
  }

  delete(idUser: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${idUser}`);
  }
}