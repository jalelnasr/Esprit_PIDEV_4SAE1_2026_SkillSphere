// ✅ Fix: localStorage is not defined (SSR / hydration)
// You MUST guard localStorage access with: typeof window !== 'undefined'

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  BackendRole,
  BackendUser,
  LoginRequest,
  RegisterRequest
} from '../models/auth.model';

type MockUser = RegisterRequest & { idUser: number };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly TOKEN_KEY = 'token';
  private readonly MOCK_USERS_KEY = 'mock_users';

  private currentUserSubject = new BehaviorSubject<BackendUser | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<BackendRole | null>(this.loadRole());
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('✅ AuthService initialized');
    console.log('   Auth URL:', this.authUrl);
  }

  // ---------------- API ----------------
  // ✅ Login with email and password
  login(email: string, password: string): Observable<AuthResponse> {
    console.log('🔐 Login attempt for:', email);
    console.log('   Request body:', { email, password: '[REDACTED]' });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, body, { headers }).pipe(
      tap(res => {
        console.log('✅ Login successful, response:', {
          token: res.token ? '[REDACTED]' : 'missing',
          user: res.nom + ' ' + res.prenom,
          role: res.role
        });
        this.handleAuthSuccess(res);
      }),
      catchError((error: any) => {
        console.error('❌ Login failed:', error.status, error.statusText);
        
        if (error?.status === 404) {
          const user = this.findMockUser(email);
          if (user && user.password === password) {
            const mockRes = this.createMockAuthResponse(user);
            console.log('✅ Login fallback successful using mock local user', email);
            this.handleAuthSuccess(mockRes);
            return of(mockRes);
          }
        }
        return throwError(() => error);
      })
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    const cleanReq = Object.fromEntries(
      Object.entries(req).filter(([, value]) => value !== null && value !== undefined)
    ) as RegisterRequest;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });

    console.log('📝 Register attempt for:', cleanReq.email);
    console.log('   Request body:', {
      email: cleanReq.email,
      nom: cleanReq.nom,
      prenom: cleanReq.prenom,
      password: '[REDACTED]'
    });
    
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, cleanReq, { headers }).pipe(
      tap(res => {
        console.log('✅ Registration successful');
        console.log('   Response token:', res.token ? '[REDACTED]' : 'missing');
        console.log('   User:', res.nom, res.prenom, res.email);
        this.handleAuthSuccess(res);
      }),
      catchError((error: any) => {
        console.error('❌ Registration failed:', error.status, error.statusText);
        console.error('   Error details:', error.error);

        if (error?.status === 404) {
          console.warn('⚠️ Register endpoint not found; using local mock fallback');
          const mockRes = this.createMockAuthResponse(cleanReq);
          this.handleAuthSuccess(mockRes);
          return of(mockRes);
        }
        return throwError(() => error);
      })
    );
  }

  // ✅ Called from Dashboard or APP_INITIALIZER
  restoreSession(): Observable<BackendUser | null> {
    const token = this.getToken();
    console.log('🔄 Restoring session, token present:', !!token);
    if (!token) {
      console.log('⚠️ No token found');
      return of(null);
    }

    return this.http.get<BackendUser>(`${this.usersUrl}/me`).pipe(
      tap(u => {
        console.log('✅ Session restored for user:', u.idUser, u.nom, u.prenom);
        this.safeSet('user', JSON.stringify(u));
        this.safeSet('role', u.role);
        this.currentUserSubject.next(u);
        this.userRoleSubject.next(u.role);
      }),
      catchError(() => {
        console.error('❌ Session restore failed');
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    console.log('🚪 Logging out user');
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
    console.log('✅ User logged out');
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
    const payload = (res as any).data ?? res;
    const token = payload.token ?? payload.jwt ?? payload.accessToken ?? payload.authToken ?? payload.user?.token;
    if (!token) {
      console.error('❌ AuthService.handleAuthSuccess: missing token in response', res);
      return;
    }
    console.log('✅ AuthService saving token:', token ? '[REDACTED]' : 'none');
    this.safeSet(this.TOKEN_KEY, token);

    const idUser = payload.idUser ?? payload.userId ?? payload.user?.id ?? 0;
    const user: BackendUser = {
      idUser,
      nom: payload.nom,
      prenom: payload.prenom,
      email: payload.email,
      role: payload.role
    };

    this.safeSet('user', JSON.stringify(user));
    this.safeSet('role', payload.role);

    this.currentUserSubject.next(user);
    this.userRoleSubject.next(payload.role);
  }

  private loadMockUsers(): MockUser[] {
    try {
      const raw = this.safeGet(this.MOCK_USERS_KEY);
      return raw ? (JSON.parse(raw) as MockUser[]) : [];
    } catch {
      return [];
    }
  }

  private saveMockUsers(users: MockUser[]): void {
    this.safeSet(this.MOCK_USERS_KEY, JSON.stringify(users));
  }

  private findMockUser(email: string): MockUser | undefined {
    return this.loadMockUsers().find(user => user.email === email);
  }

  private createMockAuthResponse(req: RegisterRequest | MockUser): AuthResponse {
    const users = this.loadMockUsers();
    const existing = users.find(user => user.email === req.email);
    if (!existing) {
      const nextId = users.length > 0 ? Math.max(...users.map(u => u.idUser)) + 1 : 1;
      users.push({ ...(req as RegisterRequest), idUser: nextId });
      this.saveMockUsers(users);
    }

    const idUser = existing?.idUser ?? (users.find(user => user.email === req.email)?.idUser ?? 0);
    const token = `mock-token-${Math.random().toString(36).substring(2, 15)}`;

    return {
      token,
      idUser,
      nom: req.nom,
      prenom: req.prenom,
      email: req.email,
      role: 'APPRENANT'
    };
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