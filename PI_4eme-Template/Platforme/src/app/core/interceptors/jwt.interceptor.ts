import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

// Routes that must NOT have a JWT token attached
const AUTH_URLS = ['/auth/login', '/auth/register', '/auth/forgot-password'];

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth endpoints — they don't need a token and an old/expired token causes 401
    const isAuthUrl = AUTH_URLS.some(url => req.url.includes(url));
    if (isAuthUrl) {
      return next.handle(req);
    }

    const token = this.hasStorage() ? localStorage.getItem('token') : null;

    if (!token) return next.handle(req);

    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(cloned);
  }
}