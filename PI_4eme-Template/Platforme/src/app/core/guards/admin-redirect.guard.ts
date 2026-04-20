import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminRedirectGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.auth.getUserRole(); // should return backend role string (ADMIN/APPRENANT/...)
    if (role === 'ADMIN') {
      this.router.navigateByUrl('/admin/dashboard');
      return false;
    }
    return true;
  }
}