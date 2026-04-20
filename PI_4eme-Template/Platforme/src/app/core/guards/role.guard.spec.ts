import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: AuthService;
  let router: Router;

  const mockState = {} as RouterStateSnapshot;

  const createRoute = (roles: string[]): ActivatedRouteSnapshot => {
    const route = new ActivatedRouteSnapshot();
    (route as any).data = { roles };
    return route;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RoleGuard,
        AuthService,
        {
          provide: Router,
          useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') }
        }
      ]
    });
    guard = TestBed.inject(RoleGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===== Pas connecté =====
  it('should redirect to /home when user is not logged in', () => {
    localStorage.removeItem('role');
    const route = createRoute(['FORMATEUR']);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  // ===== Rôle correct =====
  it('should allow FORMATEUR to access FORMATEUR route', () => {
    localStorage.setItem('role', 'FORMATEUR');
    const route = createRoute(['FORMATEUR']);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeTrue();
  });

  it('should allow APPRENANT to access APPRENANT route', () => {
    localStorage.setItem('role', 'APPRENANT');
    const route = createRoute(['APPRENANT']);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeTrue();
  });

  it('should allow ADMIN to access ADMIN route', () => {
    localStorage.setItem('role', 'ADMIN');
    const route = createRoute(['ADMIN']);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeTrue();
  });

  // ===== Rôle incorrect =====
  it('should deny APPRENANT access to FORMATEUR route', () => {
    localStorage.setItem('role', 'APPRENANT');
    const route = createRoute(['FORMATEUR']);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect ADMIN to /admin/dashboard when accessing wrong route', () => {
    localStorage.setItem('role', 'ADMIN');
    const route = createRoute(['FORMATEUR']);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('should deny FORMATEUR access to APPRENANT route', () => {
    localStorage.setItem('role', 'FORMATEUR');
    const route = createRoute(['APPRENANT']);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeFalse();
  });

  // ===== Route sans restriction de rôle =====
  it('should allow any logged-in user when no roles required', () => {
    localStorage.setItem('role', 'APPRENANT');
    const route = createRoute([]);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeTrue();
  });

  // ===== Accès multiple rôles =====
  it('should allow FORMATEUR when route accepts multiple roles', () => {
    localStorage.setItem('role', 'FORMATEUR');
    const route = createRoute(['FORMATEUR', 'ADMIN']);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeTrue();
  });

  it('should allow ADMIN when route accepts multiple roles', () => {
    localStorage.setItem('role', 'ADMIN');
    const route = createRoute(['FORMATEUR', 'ADMIN']);

    const result = guard.canActivate(route, mockState);

    expect(result).toBeTrue();
  });
});
