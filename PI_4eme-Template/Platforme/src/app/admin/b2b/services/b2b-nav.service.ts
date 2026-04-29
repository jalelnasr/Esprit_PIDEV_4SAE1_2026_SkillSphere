import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Service pour gérer la navigation dans le module B2B
 * Détermine le basePath selon le rôle de l'utilisateur
 */
@Injectable({
  providedIn: 'root'
})
export class B2bNavService {
  basePath = '/b2b'; // Valeur par défaut

  constructor(private authService: AuthService) {
    // Écouter les changements de rôle pour mettre à jour le basePath
    this.authService.userRole$.subscribe(role => {
      if (role === 'ADMIN') {
        this.basePath = '/admin/corporate';
      } else {
        this.basePath = '/b2b';
      }
    });
  }
}
