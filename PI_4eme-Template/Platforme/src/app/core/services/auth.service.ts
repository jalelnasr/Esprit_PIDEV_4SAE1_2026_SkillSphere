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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly TOKEN_KEY = 'token';

  private currentUserSubject = new BehaviorSubject<BackendUser | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<BackendRole | null>(this.loadRole());
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {}

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

    return this.http.get<BackendUser>(`${this.usersUrl}/me`).pipe(
      tap(u => {
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
    const token = this.getToken();
    const hasToken = !!token;
    console.log('🔍 [AuthService] isLoggedIn check:', { hasToken, token: token ? 'exists' : 'missing' });
    return hasToken;
  }

  getUserRole(): string | null {
    return this.safeGet('role');
  }

  getCurrentUser(): BackendUser | null {
    return this.currentUserSubject.value;
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
    console.log('🔐 [AuthService] Handling auth success:', res);
    
    this.safeSet(this.TOKEN_KEY, res.token);
    console.log('✅ [AuthService] Token saved:', this.getToken() ? 'YES' : 'NO');

    const user: BackendUser = {
      idUser: res.idUser,
      nom: res.nom,
      prenom: res.prenom,
      email: res.email,
      role: res.role
    };

    this.safeSet('user', JSON.stringify(user));
    this.safeSet('role', res.role);
    console.log('✅ [AuthService] User and role saved');

    this.currentUserSubject.next(user);
    this.userRoleSubject.next(res.role);
    console.log('✅ [AuthService] Subjects updated');
  }

  private loadUser(): BackendUser | null {
    try {
      const raw = this.safeGet('user');
      return raw ? (JSON.parse(raw) as BackendUser) : null;
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