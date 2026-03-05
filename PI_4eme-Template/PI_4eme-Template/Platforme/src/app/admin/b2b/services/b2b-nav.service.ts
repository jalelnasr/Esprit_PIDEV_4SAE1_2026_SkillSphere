import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Provides the correct base path for B2B internal navigation.
 * - ADMIN accesses B2B via /admin/corporate (Back Office)
 * - Other roles access via /corporate (Front Office)
 */
@Injectable({ providedIn: 'root' })
export class B2bNavService {

  constructor(private authService: AuthService) {}

  /** Returns '/admin/corporate' for ADMIN, '/corporate' for others */
  get basePath(): string {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' ? '/admin/corporate' : '/corporate';
  }
}
