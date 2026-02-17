import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoginRequest, LoginResponse, SignUpRequest, AuthUser } from '@shared/models';

export interface AuthUserExtended extends AuthUser {
  userRole?: 'learner' | 'instructor' | 'enterprise';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUserExtended | null>(this.loadUserFromLocalStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.loadUserFromLocalStorage());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<'learner' | 'instructor' | 'enterprise' | null>(
    this.loadUserFromLocalStorage()?.userRole ?? null
  );
  public userRole$ = this.userRoleSubject.asObservable();

  constructor() {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Mock login - replace with API call later
    const mockUser: AuthUserExtended = {
      id: '1',
      email: credentials.email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'STUDENT',
      userRole: 'learner'
    };
    
    const mockResponse: LoginResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: mockUser as unknown as AuthUser
    };
    
    localStorage.setItem('skillsphere_token', mockResponse.token);
    localStorage.setItem('skillsphere_user', JSON.stringify(mockUser));
    
    this.currentUserSubject.next(mockUser);
    this.isAuthenticatedSubject.next(true);
    this.userRoleSubject.next('learner');
    
    return of(mockResponse);
  }

  loginWithRole(email: string, password: string, role: 'learner' | 'instructor' | 'enterprise'): Observable<AuthUserExtended> {
    return new Observable(observer => {
      setTimeout(() => {
        const user: AuthUserExtended = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          firstName: 'User',
          lastName: 'Account',
          role: 'STUDENT',
          userRole: role
        };
        
        localStorage.setItem('skillsphere_token', 'mock-jwt-token-' + Date.now());
        localStorage.setItem('skillsphere_user', JSON.stringify(user));
        
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.userRoleSubject.next(role);
        
        observer.next(user);
        observer.complete();
      }, 1000);
    });
  }

  signup(data: SignUpRequest): Observable<any> {
    // Mock signup - replace with API call later
    return of({ success: true, message: 'Sign up successful' });
  }

  registerWithRole(firstName: string, lastName: string, email: string, role: 'learner' | 'instructor' | 'enterprise', password: string): Observable<AuthUserExtended> {
    return new Observable(observer => {
      setTimeout(() => {
        const user: AuthUserExtended = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          firstName,
          lastName,
          role: 'STUDENT',
          userRole: role
        };
        
        localStorage.setItem('skillsphere_token', 'mock-jwt-token-' + Date.now());
        localStorage.setItem('skillsphere_user', JSON.stringify(user));
        
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.userRoleSubject.next(role);
        
        observer.next(user);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('skillsphere_token');
    localStorage.removeItem('skillsphere_user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
  }

  getCurrentUser(): AuthUserExtended | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): 'learner' | 'instructor' | 'enterprise' | null {
    return this.userRoleSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('skillsphere_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromLocalStorage(): AuthUserExtended | null {
    const token = localStorage.getItem('skillsphere_token');
    const userJson = localStorage.getItem('skillsphere_user');
    
    if (token && userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
