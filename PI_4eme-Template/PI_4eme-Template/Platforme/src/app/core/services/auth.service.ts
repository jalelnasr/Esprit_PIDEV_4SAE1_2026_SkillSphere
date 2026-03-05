// ✅ Fix: localStorage is not defined (SSR / hydration)
// You MUST guard localStorage access with: typeof window !== 'undefined'

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  BackendRole,
  BackendUser,
  LoginRequest,
  RegisterRequest
} from '../models/auth.model';
import { ActivityLogService } from '../../admin/b2b/services/activity-log.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly TOKEN_KEY = 'token';

  private currentUserSubject = new BehaviorSubject<BackendUser | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<BackendRole | null>(this.loadRole());
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private activityLog: ActivityLogService) {}

  // ---------------- API ----------------
  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, body).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, req).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  // ✅ Called from Dashboard or APP_INITIALIZER
  restoreSession(): Observable<BackendUser | null> {
    const token = this.getToken();
    if (!token) return of(null);

    return this.http.get<any>(`${this.usersUrl}/me`).pipe(
      tap(raw => {
        console.log('[AuthService] restoreSession - raw /me response:', JSON.stringify(raw));
        // Handle both camelCase and snake_case field names from backend
        const u: BackendUser = {
          idUser: raw.idUser ?? raw.id_user ?? raw.iduser,
          nom: raw.nom,
          prenom: raw.prenom,
          email: raw.email,
          role: raw.role,
          companyId: raw.companyId ?? raw.company_id,
          phone: raw.phone,
          adresse: raw.adresse,
          isActive: raw.isActive ?? raw.is_active,
          createdAt: raw.createdAt ?? raw.created_at
        };
        console.log('[AuthService] restoreSession - mapped user:', JSON.stringify(u));
        this.safeSet('user', JSON.stringify(u));
        this.safeSet('role', u.role);
        this.currentUserSubject.next(u);
        this.userRoleSubject.next(u.role);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    this.safeRemove(this.TOKEN_KEY);
    this.safeRemove('user');
    this.safeRemove('role');

    // old/mock keys cleanup
    this.safeRemove('skillspere_token');
    this.safeRemove('skillspere_user');
    this.safeRemove('userRole');
    this.safeRemove('mock-jwt-token');

    this.currentUserSubject.next(null);
    this.userRoleSubject.next(null);
  }

  getToken(): string | null {
    return this.safeGet(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    return this.safeGet('role');
  }

  // --------- Backward compatibility ----------
  loginWithRole(email: string, password: string, _role: any): Observable<AuthResponse> {
    return this.login(email, password);
  }

  registerWithRole(firstName: string, lastName: string, email: string, role: any, password: string) {
    return this.register({
      prenom: firstName,
      nom: lastName,
      email,
      password
    });
  }

  // ---------------- Internal ----------------
  private handleAuthSuccess(res: AuthResponse): void {
    this.safeSet(this.TOKEN_KEY, res.token);

    // Handle both camelCase (idUser) and snake_case (id_user) from backend
    const rawId = (res as any).idUser ?? (res as any).id_user ?? (res as any).iduser;
    const rawCompanyId = (res as any).companyId ?? (res as any).company_id;

    const user: BackendUser = {
      idUser: rawId,
      nom: res.nom,
      prenom: res.prenom,
      email: res.email,
      role: res.role,
      companyId: rawCompanyId ?? undefined
    };

    console.log('[AuthService] handleAuthSuccess - raw response:', JSON.stringify(res));
    console.log('[AuthService] handleAuthSuccess - mapped user:', JSON.stringify(user));

    this.safeSet('user', JSON.stringify(user));
    this.safeSet('role', res.role);

    this.currentUserSubject.next(user);
    this.userRoleSubject.next(res.role);

    this.activityLog.logLogin(user.email, user.role);
  }

  private loadUser(): BackendUser | null {
    try {
      const raw = this.safeGet('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Handle snake_case from stored JSON too
      if (!parsed.idUser && parsed.id_user) {
        parsed.idUser = parsed.id_user;
      }
      console.log('[AuthService] loadUser from localStorage:', JSON.stringify(parsed));
      return parsed as BackendUser;
    } catch {
      return null;
    }
  }

  private loadRole(): BackendRole | null {
    return (this.safeGet('role') as BackendRole | null) ?? null;
  }

  // ---------------- Safe Storage (SSR proof) ----------------
  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private safeGet(key: string): string | null {
    return this.hasStorage() ? localStorage.getItem(key) : null;
  }

  private safeSet(key: string, value: string): void {
    if (this.hasStorage()) localStorage.setItem(key, value);
  }

  private safeRemove(key: string): void {
    if (this.hasStorage()) localStorage.removeItem(key);
  }
}