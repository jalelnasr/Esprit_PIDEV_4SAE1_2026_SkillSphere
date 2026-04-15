import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * ⚠️ DEPRECATED - This class-based JWT interceptor is NO LONGER USED
 * 
 * The application now uses the functional HTTP interceptor from:
 * src/app/interceptors/auth.interceptor.ts
 * 
 * This file is kept for reference only and should be removed in the future.
 * It is NOT registered in app.config.ts and will not execute.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.hasStorage() ? localStorage.getItem('token') : null;
    
    if (!token) {
      console.log('⚠️ JwtInterceptor: No token found, sending request without auth');
      return next.handle(req);
    }

    console.log('✅ JwtInterceptor: Adding Authorization header');
    console.log('   Token exists:', !!token);
    console.log('   Token length:', token.length);
    console.log('   Request:', req.method, req.url);

    return next.handle(
      req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    );
  }
}
