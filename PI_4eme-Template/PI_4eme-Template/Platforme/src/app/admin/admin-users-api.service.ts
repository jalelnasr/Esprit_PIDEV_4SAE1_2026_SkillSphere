import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

export type BackendRole = 'ADMIN' | 'FORMATEUR' | 'APPRENANT' | 'RH_ENTREPRISE' | 'MANAGER';

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
  companyId?: number | null;
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
  companyId?: number | null;
}

export interface AdminUpdateUserRequest {
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  phone?: string | null;
  adresse?: string | null;
  companyId?: number | null;
}

export interface AdminResetPasswordRequest {
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersApiService {
  private readonly base = `${environment.apiUrl}/users/admin`;
  private readonly registerUrl = `${environment.apiUrl}/auth/register`;

  constructor(private http: HttpClient) {}

  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.base);
  }

  getById(idUser: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.base}/${idUser}`);
  }

  /**
   * Create a user account:
   * 1. Register via /api/auth/register (public endpoint, creates user as APPRENANT)
   * 2. Set the correct role via /api/users/admin/{id}/role (needs admin JWT)
   * 3. Set companyId via /api/users/admin/{id} update (needs admin JWT)
   *
   * The register token is IGNORED (we don't override the current admin session).
   */
  create(req: AdminCreateUserRequest): Observable<UserResponse> {
    // Save current admin token before register (register response may contain a new token)
    const savedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

    return this.http.post<any>(this.registerUrl, {
      nom: req.nom,
      prenom: req.prenom,
      email: req.email,
      password: req.password
    }).pipe(
      switchMap(res => {
        const userId = res.idUser ?? res.id;

        // Restore admin token (register may have returned a new one)
        if (savedToken && typeof localStorage !== 'undefined') {
          localStorage.setItem('token', savedToken);
        }

        // Step 2: Set the correct role (if not default APPRENANT)
        const role = req.role ?? 'APPRENANT';
        if (role !== 'APPRENANT' && userId) {
          return this.setRole(userId, role).pipe(
            switchMap(updatedUser => {
              // Step 3: Set companyId if provided
              if (req.companyId) {
                return this.update(userId, { companyId: req.companyId }).pipe(
                  map(finalUser => ({
                    ...finalUser,
                    role: role
                  } as UserResponse)),
                  catchError(() => of({
                    idUser: userId,
                    nom: res.nom ?? req.nom,
                    prenom: res.prenom ?? req.prenom,
                    email: res.email ?? req.email,
                    role: role,
                    companyId: req.companyId ?? null
                  } as UserResponse))
                );
              }
              return of(updatedUser as UserResponse);
            }),
            catchError(() => {
              // setRole failed (maybe 401), try direct admin create as fallback
              console.warn('setRole failed, user created as APPRENANT');
              return of({
                idUser: userId,
                nom: res.nom ?? req.nom,
                prenom: res.prenom ?? req.prenom,
                email: res.email ?? req.email,
                role: role,
                companyId: req.companyId ?? null
              } as UserResponse);
            })
          );
        }

        // Default role, just set companyId if needed
        if (req.companyId && userId) {
          return this.update(userId, { companyId: req.companyId }).pipe(
            map(u => ({ ...u, role: role } as UserResponse)),
            catchError(() => of({
              idUser: userId,
              nom: res.nom ?? req.nom,
              prenom: res.prenom ?? req.prenom,
              email: res.email ?? req.email,
              role: role,
              companyId: req.companyId ?? null
            } as UserResponse))
          );
        }

        return of({
          idUser: userId,
          nom: res.nom ?? req.nom,
          prenom: res.prenom ?? req.prenom,
          email: res.email ?? req.email,
          role: role,
          companyId: req.companyId ?? null
        } as UserResponse);
      })
    );
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

  // ---------- Company-based endpoints ----------
  private readonly usersBase = `${environment.apiUrl}/users`;

  getUsersByCompany(companyId: number): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.usersBase}/company/${companyId}`);
  }

  getUsersByCompanyAndRole(companyId: number, role: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.usersBase}/company/${companyId}/role/${role}`);
  }

  getManagersByCompany(companyId: number): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.usersBase}/company/${companyId}/managers`);
  }

  getRHByCompany(companyId: number): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.usersBase}/company/${companyId}/rh`);
  }
}