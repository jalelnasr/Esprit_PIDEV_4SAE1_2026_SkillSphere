import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { map, take } from 'rxjs';

/**
 * Guard that restricts B2B pages based on user role.
 * Use in route data: { allowedRoles: ['ADMIN', 'RH_ENTREPRISE'] }
 *
 * If no allowedRoles specified, any authenticated B2B user is allowed.
 */
export const b2bRoleGuard: CanActivateFn = (route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data?.['allowedRoles'] || [];

  return auth.userRole$.pipe(
    take(1),
    map(role => {
      if (!role) {
        router.navigate(['/auth/login']);
        return false;
      }

      // If no specific roles required, allow any authenticated user
      if (allowedRoles.length === 0) return true;

      if (allowedRoles.includes(role)) {
        return true;
      }

      // Redirect to B2B dashboard if user doesn't have permission
      const basePath = role === 'ADMIN' ? '/admin/corporate' : '/corporate';
      router.navigate([basePath + '/dashboard']);
      return false;
    })
  );
};
