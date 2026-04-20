import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const authUrl = `${environment.apiUrl}/auth`;
  const usersUrl = `${environment.apiUrl}/users`;

  const mockAuthResponse = {
    token: 'jwt-token-123',
    idUser: 1,
    nom: 'Doe',
    prenom: 'John',
    email: 'john@test.com',
    role: 'APPRENANT' as any
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── login ──────────────────────────────────────────────────────────────────

  it('should login and store token', () => {
    service.login('john@test.com', 'password').subscribe(res => {
      expect(res.token).toBe('jwt-token-123');
    });

    const req = httpMock.expectOne(`${authUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('john@test.com');
    req.flush(mockAuthResponse);

    expect(service.getToken()).toBe('jwt-token-123');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should store user data after login', () => {
    service.login('john@test.com', 'password').subscribe();

    const req = httpMock.expectOne(`${authUrl}/login`);
    req.flush(mockAuthResponse);

    const user = service.getCurrentUser();
    expect(user?.email).toBe('john@test.com');
    expect(user?.role).toBe('APPRENANT');
    expect(user?.idUser).toBe(1);
  });

  // ── register ───────────────────────────────────────────────────────────────

  it('should register and store token', () => {
    const registerReq = {
      prenom: 'John',
      nom: 'Doe',
      email: 'john@test.com',
      password: 'pass123'
    };

    service.register(registerReq).subscribe(res => {
      expect(res.token).toBeTruthy();
    });

    const req = httpMock.expectOne(`${authUrl}/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);

    expect(service.isLoggedIn()).toBeTrue();
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  it('should clear all data on logout', () => {
    // First login
    service.login('john@test.com', 'password').subscribe();
    httpMock.expectOne(`${authUrl}/login`).flush(mockAuthResponse);

    expect(service.isLoggedIn()).toBeTrue();

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
    expect(service.getUserRole()).toBeNull();
  });

  // ── isLoggedIn ─────────────────────────────────────────────────────────────

  it('should return false when no token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should return true when token exists', () => {
    localStorage.setItem('token', 'some-token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  // ── getUserRole ────────────────────────────────────────────────────────────

  it('should return null role when not logged in', () => {
    expect(service.getUserRole()).toBeNull();
  });

  it('should return role after login', () => {
    service.login('john@test.com', 'password').subscribe();
    httpMock.expectOne(`${authUrl}/login`).flush(mockAuthResponse);

    expect(service.getUserRole()).toBe('APPRENANT');
  });

  // ── restoreSession ─────────────────────────────────────────────────────────

  it('should return null when no token for restoreSession', () => {
    service.restoreSession().subscribe(user => {
      expect(user).toBeNull();
    });
  });

  it('should restore session when token exists', () => {
    localStorage.setItem('token', 'valid-token');

    const mockUser = { idUser: 1, nom: 'Doe', prenom: 'John', email: 'john@test.com', role: 'APPRENANT' as any };

    service.restoreSession().subscribe(user => {
      expect(user?.email).toBe('john@test.com');
    });

    const req = httpMock.expectOne(`${usersUrl}/me`);
    req.flush(mockUser);
  });

  it('should logout when restoreSession fails', () => {
    localStorage.setItem('token', 'expired-token');

    service.restoreSession().subscribe(user => {
      expect(user).toBeNull();
    });

    const req = httpMock.expectOne(`${usersUrl}/me`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(service.isLoggedIn()).toBeFalse();
  });

  // ── currentUser$ observable ────────────────────────────────────────────────

  it('should emit user on login via observable', (done) => {
    service.currentUser$.subscribe(user => {
      if (user) {
        expect(user.email).toBe('john@test.com');
        done();
      }
    });

    service.login('john@test.com', 'password').subscribe();
    httpMock.expectOne(`${authUrl}/login`).flush(mockAuthResponse);
  });

  it('should emit null on logout via observable', (done) => {
    let emitCount = 0;
    service.currentUser$.subscribe(user => {
      emitCount++;
      if (emitCount === 3) { // initial null → user → null after logout
        expect(user).toBeNull();
        done();
      }
    });

    service.login('john@test.com', 'password').subscribe();
    httpMock.expectOne(`${authUrl}/login`).flush(mockAuthResponse);
    service.logout();
  });
});
