import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Log outgoing request with detailed debugging
    this.logRequest(req);

    return next.handle(req).pipe(
      tap((event) => {
        console.log(`✅ HTTP ${req.method} ${req.url} - Response received`);
      }),
      catchError((error: HttpErrorResponse) => {
        this.logError(req, error);
        const userMessage = this.getUserFriendlyMessage(req, error);
        
        return throwError(() => ({
          status: error.status,
          message: userMessage,
          error: error.error,
          timestamp: new Date().toISOString()
        }));
      })
    );
  }

  /**
   * Log outgoing requests with full details for debugging
   */
  private logRequest(req: HttpRequest<any>): void {
    const isAuthEndpoint = req.url.includes('/api/auth');
    const isRegistration = req.url.includes('/register');
    
    console.group(`📤 ${req.method} ${req.url}`);
    console.log('Headers:', {
      'Authorization': req.headers.get('Authorization') ? '[REDACTED]' : 'Not set',
      'Content-Type': req.headers.get('Content-Type') || 'Not set',
      'Accept': req.headers.get('Accept') || 'Not set'
    });
    
    if (req.body) {
      if (isRegistration || isAuthEndpoint) {
        // Redact sensitive fields in auth endpoints
        const bodyLog = { ...req.body };
        if (bodyLog.password) bodyLog.password = '[REDACTED]';
        if (bodyLog.confirmPassword) bodyLog.confirmPassword = '[REDACTED]';
        console.log('Body:', bodyLog);
      } else {
        console.log('Body:', req.body);
      }
    }
    
    console.log('Full URL:', req.urlWithParams);
    console.groupEnd();
  }

  /**
   * Log error responses with full details for debugging
   */
  private logError(req: HttpRequest<any>, error: HttpErrorResponse): void {
    console.group(`❌ HTTP Error: ${req.method} ${req.url}`);
    console.error('Status:', error.status, error.statusText);
    console.error('Response Headers:', {
      'Content-Type': error.headers.get('Content-Type'),
      'X-Error-Message': error.headers.get('X-Error-Message')
    });
    console.error('Response Body:', error.error);
    console.error('Message:', error.message);
    console.error('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }

  /**
   * Generate user-friendly error messages based on status and context
   */
  private getUserFriendlyMessage(req: HttpRequest<any>, error: HttpErrorResponse): string {
    const isRegistration = req.url.includes('/register');
    const isLogin = req.url.includes('/login');

    // Network errors
    if (error.status === 0) {
      return '🔌 Cannot connect to server. Is the backend running at http://localhost:8085?';
    }

    // Registration-specific errors
    if (isRegistration) {
      switch (error.status) {
        case 400:
          const fieldError = error.error?.fieldErrors;
          if (fieldError) {
            const fields = Object.entries(fieldError)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            return `❌ Validation error: ${fields}`;
          }
          return '❌ Invalid registration data. Please check your inputs.';
        case 409:
          return '❌ Email already registered. Please use a different email or login.';
        case 422:
          return '❌ Unprocessable entity. Check all required fields are filled correctly.';
        case 500:
          return '❌ Server error during registration. Please try again later.';
        case 503:
          return '❌ Service temporarily unavailable. Please try again later.';
      }
    }

    // Login-specific errors
    if (isLogin) {
      switch (error.status) {
        case 401:
          return '❌ Invalid email or password.';
        case 404:
          return '❌ User not found. Please register first.';
        case 429:
          return '❌ Too many login attempts. Please try again later.';
      }
    }

    // Generic HTTP errors
    switch (error.status) {
      case 400:
        return `❌ Bad request: ${error.error?.message || 'Invalid data'}`;
      case 401:
        return '❌ Unauthorized. Please login again.';
      case 403:
        return '❌ Access denied.';
      case 404:
        return '❌ Resource not found.';
      case 500:
        return '❌ Server error. Contact support.';
      case 503:
        return '❌ Service unavailable. Please try again later.';
      default:
        return error.error?.message || 'An error occurred. Please try again.';
    }
  }
}

