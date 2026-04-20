import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthGuard', () => {
  let authService: AuthService;
  let router: Router;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl'), createUrlTree: jasmine.createSpy('createUrlTree') }
        }
      ]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===== Accès autorisé =====
  it('should allow access when user is logged in', () => {
    localStorage.setItem('token', 'valid-token');

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBeTrue();
  });

  // ===== Accès refusé =====
  it('should deny access and redirect to /home when not logged in', () => {
    localStorage.removeItem('token');

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('should deny access when token is empty string', () => {
    localStorage.setItem('token', '');

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBeFalse();
  });

  // ===== Après logout =====
  it('should deny access after logout', () => {
    localStorage.setItem('token', 'valid-token');
    authService.logout();

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });
});
