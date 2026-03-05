import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test-competition-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <h1>🔍 Test Competition Detail</h1>
      
      <div style="margin: 1rem 0;">
        <p><strong>Competition ID:</strong> {{ competitionId }}</p>
        <p><strong>URL:</strong> {{ currentUrl }}</p>
      </div>
      
      <button (click)="loadCompetition()" style="padding: 0.5rem 1rem; margin-right: 1rem;">
        Charger Compétition
      </button>
      
      <div *ngIf="loading" style="color: blue;">
        ⏳ Chargement...
      </div>
      
      <div *ngIf="error" style="color: red; background: #ffe6e6; padding: 1rem; border-radius: 4px;">
        ❌ Erreur: {{ error }}
      </div>
      
      <div *ngIf="competition" style="background: #e6ffe6; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
        <h3>✅ Compétition chargée:</h3>
        <p><strong>Titre:</strong> {{ competition.title }}</p>
        <p><strong>Description:</strong> {{ competition.description }}</p>
        <p><strong>Type:</strong> {{ competition.type }}</p>
        <p><strong>Statut:</strong> {{ competition.status }}</p>
      </div>
      
      <div style="margin-top: 2rem;">
        <h3>🔧 Actions de test:</h3>
        <button (click)="testSms()" style="padding: 0.5rem 1rem; margin: 0.5rem;">
          Test SMS
        </button>
        <button (click)="testChat()" style="padding: 0.5rem 1rem; margin: 0.5rem;">
          Test Chat
        </button>
      </div>
      
      <div *ngIf="testResult" style="background: #f5f5f5; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
        <h4>Résultat du test:</h4>
        <pre>{{ testResult | json }}</pre>
      </div>
    </div>
  `
})
export class TestCompetitionDetailComponent implements OnInit {
  competitionId: string | null = null;
  currentUrl: string = '';
  competition: any = null;
  loading = false;
  error: string | null = null;
  testResult: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.competitionId = this.route.snapshot.paramMap.get('id');
    this.currentUrl = window.location.href;
    
    console.log('🔍 Test Competition Detail Init');
    console.log('Competition ID:', this.competitionId);
    console.log('Route params:', this.route.snapshot.params);
    console.log('URL:', this.currentUrl);
    
    if (this.competitionId) {
      this.loadCompetition();
    }
  }

  loadCompetition() {
    if (!this.competitionId) {
      this.error = 'Aucun ID de compétition';
      return;
    }

    this.loading = true;
    this.error = null;
    this.competition = null;

    const url = `http://localhost:8087/api/competitions/${this.competitionId}`;
    console.log('🔍 Loading competition from:', url);

    this.http.get(url).subscribe({
      next: (data) => {
        console.log('✅ Competition loaded:', data);
        this.competition = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading competition:', err);
        this.error = err.message || 'Erreur inconnue';
        this.loading = false;
      }
    });
  }

  testSms() {
    this.http.get('http://localhost:8087/api/sms/statistics').subscribe({
      next: (data) => {
        this.testResult = { type: 'SMS', success: true, data };
      },
      error: (err) => {
        this.testResult = { type: 'SMS', success: false, error: err.message };
      }
    });
  }

  testChat() {
    if (!this.competitionId) {
      this.testResult = { type: 'Chat', success: false, error: 'Pas d\'ID de compétition' };
      return;
    }

    this.http.get(`http://localhost:8087/api/chat/competition/${this.competitionId}/history`).subscribe({
      next: (data) => {
        this.testResult = { type: 'Chat', success: true, data };
      },
      error: (err) => {
        this.testResult = { type: 'Chat', success: false, error: err.message };
      }
    });
  }
}