import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.hasStorage() ? localStorage.getItem('token') : null;

    // ✅ ne jamais ajouter le token pour auth endpoints
    const isAuthRequest =
      req.url.includes('/api/auth/login') ||
      req.url.includes('/api/auth/register') ||
      req.url.includes('/api/auth/forgot-password') ||
      req.url.includes('/api/auth/reset-password');

    // ✅ ajouter le token uniquement vers le gateway (ou localhost backend si tu appelles direct)
    const isGatewayOrBackend =
      req.url.startsWith('http://localhost:8080') ||
      req.url.startsWith('http://localhost:8086') ||
      req.url.startsWith('http://localhost:8087');

    if (!token || isAuthRequest || !isGatewayOrBackend) {
      return next.handle(req);
    }

    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(clonedReq);
  }
}