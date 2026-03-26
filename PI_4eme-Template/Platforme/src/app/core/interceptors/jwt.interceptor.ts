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
    console.log('🔐 [JWT Interceptor]', {
      url: req.url,
      token: token ? 'EXISTS' : 'MISSING',
      hasStorage: this.hasStorage()
    });
    
    if (!token) return next.handle(req);

    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    console.log('📤 [JWT Interceptor] Request with Authorization header');
    
    return next.handle(cloned);
  }
}