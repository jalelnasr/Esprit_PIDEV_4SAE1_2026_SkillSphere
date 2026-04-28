import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ActivityLogService } from '../../admin/b2b/services/activity-log.service';
import { environment } from '../../../environments/environment';
import { AuthResponse, BackendUser, BackendRole } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let activityLogSpy: jasmine.SpyObj<ActivityLogService>;

  const mockAuthResponse: AuthResponse = {
    token: 'mock-jwt-token',
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@example.com',
    role: 'COMPANY_HR' as BackendRole,
    idUser: 1,
    companyId: 100
  };

  const mockUser: BackendUser = {
    idUser: 1,
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@example.com',
    role: 'COMPANY_HR' as BackendRole,
    companyId: 100
  };

  beforeEach(() => {
    const activityLogSpyObj = jasmine.createSpyObj('ActivityLogService', ['logLogin']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ActivityLogService, useValue: activityLogSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    activityLogSpy = TestBed.inject(ActivityLogService) as jasmine.SpyObj<ActivityLogService>;

    // Clear localStorage before each test
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  });

  afterEach(() => {
    httpMock.verify();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store token', (done) => {
      const email = 'john.doe@example.com';
      const password = 'password123';

      service.login(email, password).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.getToken()).toBe('mock-jwt-token');
        expect(service.isLoggedIn()).toBe(true);
        expect(activityLogSpy.logLogin).toHaveBeenCalledWith(email, 'COMPANY_HR');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockAuthResponse);
    });

    it('should handle login error', (done) => {
      service.login('wrong@example.com', 'wrong').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register successfully', (done) => {
      const registerReq = {
        prenom: 'John',
        nom: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      service.register(registerReq).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.getToken()).toBe('mock-jwt-token');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerReq);
      req.flush(mockAuthResponse);
    });
  });

  describe('restoreSession', () => {
    it('should restore session successfully', (done) => {
      // Set token first
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', 'existing-token');
      }

      service.restoreSession().subscribe(user => {
        expect(user).toBeTruthy();
        expect(user?.email).toBe('john.doe@example.com');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should return null if no token exists', (done) => {
      service.restoreSession().subscribe(user => {
        expect(user).toBeNull();
        done();
      });

      httpMock.expectNone(`${environment.apiUrl}/users/me`);
    });

    it('should logout on restore error', (done) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', 'invalid-token');
      }

      service.restoreSession().subscribe(user => {
        expect(user).toBeNull();
        expect(service.getToken()).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear all auth data', () => {
      // Set some data first
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('role', 'COMPANY_HR');
      }

      service.logout();

      expect(service.getToken()).toBeNull();
      expect(service.getUserRole()).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token if exists', () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', 'test-token');
      }
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null if no token', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if token exists', () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', 'test-token');
      }
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false if no token', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getUserRole', () => {
    it('should return role if exists', () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('role', 'COMPANY_HR');
      }
      expect(service.getUserRole()).toBe('COMPANY_HR');
    });

    it('should return null if no role', () => {
      expect(service.getUserRole()).toBeNull();
    });
  });

  describe('currentUser$ observable', () => {
    it('should emit user after login', (done) => {
      service.currentUser$.subscribe(user => {
        if (user) {
          expect(user.email).toBe('john.doe@example.com');
          done();
        }
      });

      service.login('john.doe@example.com', 'password123').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
    });

    it('should emit null after logout', (done) => {
      // Login first
      service.login('john.doe@example.com', 'password123').subscribe(() => {
        // Then logout
        service.logout();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);

      // Check that currentUser$ emits null
      setTimeout(() => {
        service.currentUser$.subscribe(user => {
          expect(user).toBeNull();
          done();
        });
      }, 100);
    });
  });

  describe('userRole$ observable', () => {
    it('should emit role after login', (done) => {
      service.userRole$.subscribe(role => {
        if (role) {
          expect(role).toBe('COMPANY_HR');
          done();
        }
      });

      service.login('john.doe@example.com', 'password123').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
    });
  });

  describe('backward compatibility methods', () => {
    it('loginWithRole should call login', (done) => {
      service.loginWithRole('john.doe@example.com', 'password123', 'COMPANY_HR').subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
    });

    it('registerWithRole should call register', (done) => {
      service.registerWithRole('John', 'Doe', 'john.doe@example.com', 'COMPANY_HR', 'password123').subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush(mockAuthResponse);
    });
  });
});
