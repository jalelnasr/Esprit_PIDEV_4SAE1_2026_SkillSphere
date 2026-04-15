import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * AUTH INTERCEPTOR - Handles automatic token injection for protected endpoints
 * 
 * RULES:
 * - NO token for: /api/auth/register, /api/auth/login, /api/auth/refresh
 * - YES token for: all other endpoints (requires valid token)
 * - Automatically adds Content-Type header for JSON requests
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Public endpoints that NEVER need authentication
  const publicEndpoints = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];

  const rawToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const token = normalizeToken(rawToken);
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  // Build request with proper headers
  let modifiedReq = req;

  // Ensure Content-Type is application/json for POST/PUT/PATCH requests with body
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && 
      req.body && 
      !req.headers.has('Content-Type')) {
    modifiedReq = modifiedReq.clone({
      setHeaders: { 'Content-Type': 'application/json' }
    });
  }

  // Add Authorization header for protected endpoints
  if (token && !isPublicEndpoint) {
    modifiedReq = modifiedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(`✅ Auth token attached for: ${req.method} ${req.url}`);
  } else if (!token && !isPublicEndpoint) {
    console.warn(`⚠️ No auth token available for protected endpoint: ${req.method} ${req.url}`);
  } else if (isPublicEndpoint) {
    console.log(`🔓 Public endpoint (no auth needed): ${req.method} ${req.url}`);
  }

  return next(modifiedReq).pipe(
    tap(
      () => {
        console.log(`✅ Response received: ${req.method} ${req.url}`);
      },
      (error) => {
        if (error?.status === 401 && !isPublicEndpoint && typeof window !== 'undefined') {
          // Prevent stale/invalid tokens from causing repeated unauthorized calls.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
        }
        console.error(`❌ Request failed: ${req.method} ${req.url}`, error);
      }
    )
  );
};

function normalizeToken(token: string | null): string | null {
  if (!token) {
    return null;
  }

  let clean = token.trim().replace(/^"|"$/g, '');
  if (clean.toLowerCase().startsWith('bearer ')) {
    clean = clean.slice(7).trim();
  }

  if (clean.startsWith('mock-token-')) {
    return null;
  }

  return clean;
}
