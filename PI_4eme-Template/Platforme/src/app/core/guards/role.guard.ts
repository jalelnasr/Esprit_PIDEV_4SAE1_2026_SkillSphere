import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = (route.data['roles'] as string[]) ?? [];
    const userRole = this.authService.getUserRole(); // 'ADMIN'|'APPRENANT'|'FORMATEUR'|'RH_ENTREPRISE'|null

    console.log('🔒 RoleGuard check:', {
      url: state.url,
      requiredRoles,
      userRole,
      isLoggedIn: this.authService.isLoggedIn()
    });

    if (!userRole) {
      console.warn('⚠️ RoleGuard: No user role found, redirecting to home');
      this.router.navigateByUrl('/home');
      return false;
    }

    if (requiredRoles.length === 0) {
      console.log('✅ RoleGuard: No specific roles required, access granted');
      return true;
    }

    if (!requiredRoles.includes(userRole)) {
      console.warn(`⚠️ RoleGuard: User role "${userRole}" not in required roles [${requiredRoles.join(', ')}]`);
      if (userRole === 'ADMIN') {
        this.router.navigateByUrl('/admin/dashboard');
        return false;
      }
      this.router.navigateByUrl('/dashboard');
      return false;
    }

    console.log('✅ RoleGuard: Access granted');
    return true;
  }
}