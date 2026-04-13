import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { B2bCandidateService } from '../../../admin/b2b/services/candidate.service';

@Component({
  selector: 'app-become-freelancer-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="banner" *ngIf="showBanner">
      <div class="banner-content">
        <div class="banner-icon">🚀</div>
        <div class="banner-text">
          <h3>Devenez Freelancer !</h3>
          <p>Gagnez de l'argent en travaillant sur des missions freelance</p>
        </div>
        <a routerLink="/freelancer/become" class="banner-btn">
          Commencer →
        </a>
      </div>
    </div>
  `,
  styles: [`
    .banner { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
    
    .banner-content { display: flex; align-items: center; gap: 20px; }
    
    .banner-icon { font-size: 48px; }
    
    .banner-text { flex: 1; color: white; }
    .banner-text h3 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
    .banner-text p { font-size: 14px; opacity: 0.9; margin: 0; }
    
    .banner-btn { padding: 12px 24px; background: white; color: #667eea; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; transition: all 0.2s; white-space: nowrap; }
    .banner-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    
    @media (max-width: 768px) {
      .banner-content { flex-direction: column; text-align: center; }
      .banner-icon { font-size: 36px; }
    }
  `]
})
export class BecomeFreelancerBannerComponent implements OnInit {
  showBanner = false;
  userId: number | null = null;

  constructor(
    private authSvc: AuthService,
    private candidateSvc: B2bCandidateService
  ) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user && user.role === 'APPRENANT') {
        this.userId = user.id;
        this.checkIfAlreadyFreelancer();
      }
    });
  }

  checkIfAlreadyFreelancer() {
    if (!this.userId) return;

    // Vérifier si l'utilisateur a déjà un profil freelancer
    this.candidateSvc.getById(this.userId).subscribe({
      next: () => {
        // L'utilisateur a déjà un profil freelancer
        this.showBanner = false;
      },
      error: () => {
        // L'utilisateur n'a pas encore de profil freelancer
        this.showBanner = true;
      }
    });
  }
}
