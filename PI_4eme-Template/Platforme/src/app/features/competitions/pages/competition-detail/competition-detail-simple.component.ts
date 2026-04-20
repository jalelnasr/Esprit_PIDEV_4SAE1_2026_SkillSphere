import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-competition-detail-simple',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelectorComponent],
  template: `
    <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <!-- Header avec sélecteur de langue -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <button class="btn btn-secondary" routerLink="/competitions">← {{ 'common.back' | translate }}</button>
        <app-language-selector></app-language-selector>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" style="text-align: center; padding: 3rem;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 1rem;">{{ 'common.loading' | translate }}</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" style="background: #ffe6e6; color: #d8000c; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
        ❌ {{ error }}
      </div>

      <!-- Competition Content -->
      <div *ngIf="competition && !loading">
        <!-- Title -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
          <h1 style="margin: 0; font-size: 2rem;">{{ competition.title }}</h1>
          <div style="margin-top: 1rem;">
            <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; margin-right: 1rem;">
              {{ competition.status }}
            </span>
            <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; margin-right: 1rem;">
              {{ competition.type }}
            </span>
            <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px;">
              {{ competition.participationType }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <h2 style="color: #333; margin-bottom: 1rem;">📋 {{ 'competitions.description' | translate }}</h2>
          <p style="line-height: 1.6; color: #666;">{{ competition.description }}</p>
        </div>

        <!-- Info Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-bottom: 1rem;">📅 {{ 'competitions.startDate' | translate }}</h3>
            <p style="font-size: 1.1rem; color: #666;">{{ competition.startDate | date: 'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-bottom: 1rem;">📅 {{ 'competitions.endDate' | translate }}</h3>
            <p style="font-size: 1.1rem; color: #666;">{{ competition.endDate | date: 'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-bottom: 1rem;">👥 {{ 'competitions.maxTeams' | translate }}</h3>
            <p style="font-size: 1.1rem; color: #666;">{{ competition.maxParticipants }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <h3 style="color: #333; margin-bottom: 1rem;">🎯 Actions</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button (click)="viewLeaderboard()" style="background: #4CAF50; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
              🏆 {{ 'leaderboard.title' | translate }}
            </button>
            <button (click)="toggleSmsPanel()" style="background: #2196F3; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
              📱 Test SMS
            </button>
            <button (click)="testChat()" style="background: #FF9800; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
              💬 Test Chat
            </button>
          </div>
        </div>

        <!-- SMS Panel -->
        <div *ngIf="showSmsPanel" style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <h3 style="color: #333; margin-bottom: 1rem;">📱 Test SMS</h3>
          <button (click)="testSmsApi()" style="background: #4CAF50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
            Tester API SMS
          </button>
          <div *ngIf="smsResult" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 6px;">
            <pre>{{ smsResult | json }}</pre>
          </div>
        </div>

        <!-- Chat Test Result -->
        <div *ngIf="chatResult" style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #333; margin-bottom: 1rem;">💬 Résultat Chat</h3>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto;">{{ chatResult | json }}</pre>
        </div>
      </div>
    </div>

    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
      }
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      .btn:hover {
        opacity: 0.9;
      }
    </style>
  `
})
export class CompetitionDetailSimpleComponent implements OnInit {
  competition: any = null;
  loading = false;
  error: string | null = null;
  showSmsPanel = false;
  smsResult: any = null;
  chatResult: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompetition(Number(id));
    } else {
      this.error = 'ID de compétition manquant';
    }
  }

  loadCompetition(id: number) {
    this.loading = true;
    this.error = null;

    this.http.get(`http://localhost:8087/api/competitions/${id}`).subscribe({
      next: (data) => {
        this.competition = data;
        this.loading = false;
        console.log('✅ Competition loaded:', data);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la compétition: ' + err.message;
        this.loading = false;
        console.error('❌ Error loading competition:', err);
      }
    });
  }

  viewLeaderboard() {
    if (this.competition) {
      this.router.navigate(['/competitions', this.competition.competitionId, 'leaderboard']);
    }
  }

  toggleSmsPanel() {
    this.showSmsPanel = !this.showSmsPanel;
    this.smsResult = null;
  }

  testSmsApi() {
    this.http.get('http://localhost:8087/api/sms/statistics').subscribe({
      next: (data) => {
        this.smsResult = { success: true, data };
      },
      error: (err) => {
        this.smsResult = { success: false, error: err.message };
      }
    });
  }

  testChat() {
    if (!this.competition) return;

    this.http.get(`http://localhost:8087/api/chat/competition/${this.competition.competitionId}/history`).subscribe({
      next: (data) => {
        this.chatResult = { success: true, data };
      },
      error: (err) => {
        this.chatResult = { success: false, error: err.message };
      }
    });
  }
}