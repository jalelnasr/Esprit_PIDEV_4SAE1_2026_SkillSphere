import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * ⚠️ DEPRECATED - This class-based AuthInterceptor is NO LONGER USED
 * 
 * The application now uses the functional HTTP interceptor from:
 * src/app/interceptors/auth.interceptor.ts
 * 
 * This file is kept for reference only and should be removed in the future.
 * It is NOT registered in app.config.ts and will not execute.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token && !req.url.includes('/api/auth')) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ AuthInterceptor: attached token to', authReq.url);
      return next.handle(authReq);
    }

    if (!token) {
      console.log('⚠️ AuthInterceptor: no token found');
    } else {
      console.log('⚠️ AuthInterceptor skipped auth endpoint', req.url);
    }

    return next.handle(req);
  }
}
