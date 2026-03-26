import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = auth.isLoggedIn();
  console.log('🔐 AuthGuard check:', {
    url: state.url,
    isLoggedIn,
    token: auth.getToken() ? 'present' : 'missing'
  });

  if (isLoggedIn) {
    console.log('✅ AuthGuard: User is logged in, access granted');
    return true;
  }

  console.warn('⚠️ AuthGuard: User not logged in, redirecting to home');
  router.navigateByUrl('/home');
  return false;
};