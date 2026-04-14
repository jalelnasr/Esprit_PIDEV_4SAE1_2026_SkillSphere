import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    const requiredRoles = (route.data['roles'] as string[]) ?? [];
    const userRole = this.authService.getUserRole(); // 'ADMIN'|'APPRENANT'|'FORMATEUR'|'RH_ENTREPRISE'|null

    if (!userRole) {
      this.router.navigateByUrl('/home');
      return false;
    }

    if (requiredRoles.length === 0) return true;

    if (!requiredRoles.includes(userRole)) {
      if (userRole === 'ADMIN') {
        this.router.navigateByUrl('/admin/dashboard');
        return false;
      }
      this.router.navigateByUrl('/dashboard');
      return false;
    }

    return true;
  }
}