import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-freelancer-floating-button',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a *ngIf="showButton" routerLink="/freelance" class="floating-button" title="Missions Freelance">
      <span class="icon">🚀</span>
      <span class="text">Missions Freelance</span>
      <span class="badge">NEW</span>
    </a>
  `,
  styles: [`
    .floating-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 50px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      z-index: 9999;
      transition: all 0.3s ease;
      font-weight: 700;
      font-size: 16px;
    }

    .floating-button:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6);
    }

    .icon {
      font-size: 24px;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .text {
      font-size: 16px;
    }

    .badge {
      padding: 4px 8px;
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.1);
      }
    }

    @media (max-width: 768px) {
      .floating-button {
        bottom: 20px;
        right: 20px;
        padding: 12px 16px;
      }

      .text {
        display: none;
      }

      .icon {
        font-size: 28px;
      }
    }
  `]
})
export class FreelancerFloatingButtonComponent implements OnInit {
  showButton = false;

  constructor(private authSvc: AuthService) {}

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      // Afficher le bouton uniquement pour les APPRENANT
      this.showButton = user?.role === 'APPRENANT';
    });
  }
}
