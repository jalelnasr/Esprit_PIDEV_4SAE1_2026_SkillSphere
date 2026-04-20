import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockAuthResponse = {
    token: 'eyJhbGciOiJIUzI1NiJ9.test',
    idUser: 8,
    nom: 'aziz',
    prenom: 'aziz',
    email: 'aziz@gmail.com',
    role: 'FORMATEUR' as const
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===== Tests logique métier: login =====

  it('login() should call POST and store token', () => {
    service.login('aziz@gmail.com', 'azizaziz').subscribe(res => {
      expect(res.token).toBe(mockAuthResponse.token);
      expect(res.role).toBe('FORMATEUR');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'aziz@gmail.com', password: 'azizaziz' });
    req.flush(mockAuthResponse);

    expect(service.getToken()).toBe(mockAuthResponse.token);
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('login() should update currentUser$ observable', (done) => {
    service.login('aziz@gmail.com', 'azizaziz').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockAuthResponse);

    service.currentUser$.subscribe(user => {
      if (user) {
        expect(user.email).toBe('aziz@gmail.com');
        expect(user.role).toBe('FORMATEUR');
        done();
      }
    });
  });

  // ===== Tests logique métier: logout =====

  it('logout() should clear token and user', () => {
    service.login('aziz@gmail.com', 'azizaziz').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockAuthResponse);

    expect(service.isLoggedIn()).toBeTrue();

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(service.getUserRole()).toBeNull();
  });

  it('logout() should emit null to currentUser$', (done) => {
    service.logout();

    service.currentUser$.subscribe(user => {
      expect(user).toBeNull();
      done();
    });
  });

  // ===== Tests logique métier: rôles =====

  it('getUserRole() should return FORMATEUR after login', () => {
    service.login('aziz@gmail.com', 'azizaziz').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockAuthResponse);

    expect(service.getUserRole()).toBe('FORMATEUR');
  });

  it('getUserRole() should return null when not logged in', () => {
    expect(service.getUserRole()).toBeNull();
  });

  it('isLoggedIn() should return false when no token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  // ===== Tests register =====

  it('register() should call POST to register endpoint', () => {
    const registerData = {
      prenom: 'Ahmed',
      nom: 'Ben Ali',
      email: 'ahmed@gmail.com',
      password: 'password123'
    };

    service.register(registerData).subscribe(res => {
      expect(res.email).toBe('aziz@gmail.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });
});
