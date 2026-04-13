import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { B2bCandidateService } from '../../admin/b2b/services/candidate.service';

@Component({
  selector: 'app-freelancer-cta-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cta-card" *ngIf="showCard">
      <div class="cta-background"></div>
      <div class="cta-content">
        <div class="cta-icon">🚀</div>
        <div class="cta-text">
          <h2>Devenez Freelancer !</h2>
          <p>Transformez vos compétences en revenus. Accédez à des missions freelance et gagnez de l'argent.</p>
          <ul class="benefits">
            <li>💰 Revenus supplémentaires</li>
            <li>⏰ Flexibilité totale</li>
            <li>📈 Développez vos compétences</li>
          </ul>
        </div>
        <a routerLink="/freelancer/become" class="cta-button">
          Commencer maintenant →
        </a>
      </div>
    </div>
  `,
  styles: [`
    .cta-card {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 40px;
      margin: 24px 0;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
    }

    .cta-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.05)"/></svg>');
      opacity: 0.3;
    }

    .cta-content {
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 32px;
      align-items: center;
    }

    .cta-icon {
      font-size: 64px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .cta-text {
      color: white;
    }

    .cta-text h2 {
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 12px;
    }

    .cta-text p {
      font-size: 16px;
      opacity: 0.95;
      margin: 0 0 16px;
      line-height: 1.6;
    }

    .benefits {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .benefits li {
      font-size: 14px;
      font-weight: 600;
      opacity: 0.9;
    }

    .cta-button {
      padding: 16px 32px;
      background: white;
      color: #667eea;
      border-radius: 12px;
      text-decoration: none;
      font-size: 16px;
      font-weight: 700;
      transition: all 0.3s ease;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    @media (max-width: 968px) {
      .cta-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 24px;
      }

      .cta-icon {
        font-size: 48px;
      }

      .benefits {
        justify-content: center;
      }

      .cta-button {
        width: 100%;
      }
    }
  `]
})
export class FreelancerCtaCardComponent implements OnInit {
  showCard = false;
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
        this.showCard = false;
      },
      error: () => {
        // L'utilisateur n'a pas encore de profil freelancer
        this.showCard = true;
      }
    });
  }
}
