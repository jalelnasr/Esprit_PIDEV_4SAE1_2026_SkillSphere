import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ===== Ajout du token =====
  it('should add Authorization header for backend requests when token exists', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.get('http://localhost:8087/api/competitions').subscribe();

    const req = httpMock.expectOne('http://localhost:8087/api/competitions');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush([]);
  });

  it('should add Authorization header for gateway requests', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.get('http://localhost:8080/api/users').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush([]);
  });

  it('should add Authorization header for port 8086 requests', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.get('http://localhost:8086/api/users/me').subscribe();

    const req = httpMock.expectOne('http://localhost:8086/api/users/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush({});
  });

  // ===== Pas de token =====
  it('should NOT add Authorization header when no token', () => {
    localStorage.removeItem('token');

    http.get('http://localhost:8087/api/competitions').subscribe();

    const req = httpMock.expectOne('http://localhost:8087/api/competitions');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush([]);
  });

  // ===== Endpoints auth exclus =====
  it('should NOT add token for login endpoint', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.post('http://localhost:8080/api/auth/login', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('should NOT add token for register endpoint', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.post('http://localhost:8080/api/auth/register', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('should NOT add token for forgot-password endpoint', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.post('http://localhost:8080/api/auth/forgot-password', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/forgot-password');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('should NOT add token for reset-password endpoint', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.post('http://localhost:8080/api/auth/reset-password', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/reset-password');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  // ===== URL externe =====
  it('should NOT add token for external URLs', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.get('https://external-api.com/data').subscribe();

    const req = httpMock.expectOne('https://external-api.com/data');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  // ===== Request non modifiée =====
  it('should not modify the original request', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.get('http://localhost:8087/api/competitions').subscribe();

    const req = httpMock.expectOne('http://localhost:8087/api/competitions');
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe('http://localhost:8087/api/competitions');
    req.flush([]);
  });
});
