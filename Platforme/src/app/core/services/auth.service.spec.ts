import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

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

  it('should login and persist token/user/role', () => {
    service.login('benzo@gmail.com', 'secret').subscribe((res) => {
      expect(res.email).toBe('benzo@gmail.com');
      expect(localStorage.getItem('token')).toBe('jwt-token');
      expect(localStorage.getItem('role')).toBe('FORMATEUR');
      expect(service.isLoggedIn()).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'benzo@gmail.com', password: 'secret' });

    req.flush({
      token: 'jwt-token',
      idUser: 7,
      nom: 'Ben',
      prenom: 'Zo',
      email: 'benzo@gmail.com',
      role: 'FORMATEUR'
    });
  });

  it('should remove null and undefined fields before register request', () => {
    service.register({
      nom: 'Ben',
      prenom: 'Zo',
      email: 'benzo@gmail.com',
      password: 'secret',
      phone: null,
      adresse: undefined
    }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nom: 'Ben',
      prenom: 'Zo',
      email: 'benzo@gmail.com',
      password: 'secret'
    });

    req.flush({
      token: 'jwt-token',
      idUser: 7,
      nom: 'Ben',
      prenom: 'Zo',
      email: 'benzo@gmail.com',
      role: 'APPRENANT'
    });
  });

  it('should fallback to local mock user when login endpoint returns 404', (done) => {
    localStorage.setItem('mock_users', JSON.stringify([
      {
        idUser: 3,
        nom: 'Mock',
        prenom: 'User',
        email: 'mock@example.com',
        password: 'mock-pass'
      }
    ]));

    service.login('mock@example.com', 'mock-pass').subscribe((res) => {
      expect(res.role).toBe('APPRENANT');
      expect(service.getToken()).toContain('mock-token-');
      expect(service.getUserRole()).toBe('APPRENANT');
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('should return null and skip API call when restoring session without token', () => {
    service.restoreSession().subscribe((user) => {
      expect(user).toBeNull();
    });

    httpMock.expectNone(`${environment.apiUrl}/users/me`);
  });

  it('should logout and return null when restoreSession API fails', () => {
    localStorage.setItem('token', 'old-token');
    localStorage.setItem('user', JSON.stringify({ idUser: 5, nom: 'A', prenom: 'B', email: 'a@b.com', role: 'APPRENANT' }));
    localStorage.setItem('role', 'APPRENANT');

    service.restoreSession().subscribe((user) => {
      expect(user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
});
