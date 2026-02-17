import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredRoles = route.data['roles'] as string[];
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.router.navigate(['/home']);
      return false;
    }

    if (requiredRoles && !requiredRoles.includes(userRole)) {
      // Block access to modules not allowed for this role
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
