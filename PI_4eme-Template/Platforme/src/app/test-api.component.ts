import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test-api',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <h1>🔍 Test API</h1>
      
      <div style="margin: 1rem 0;">
        <button (click)="testCompetitions()" style="padding: 0.5rem 1rem; margin-right: 1rem;">
          Test Competitions API
        </button>
        <button (click)="testSms()" style="padding: 0.5rem 1rem;">
          Test SMS API
        </button>
      </div>
      
      <div *ngIf="loading" style="color: blue;">
        ⏳ Chargement...
      </div>
      
      <div *ngIf="error" style="color: red; background: #ffe6e6; padding: 1rem; border-radius: 4px;">
        ❌ Erreur: {{ error }}
      </div>
      
      <div *ngIf="result" style="background: #f5f5f5; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
        <h3>✅ Résultat:</h3>
        <pre>{{ result | json }}</pre>
      </div>
    </div>
  `
})
export class TestApiComponent {
  result: any = null;
  error: string | null = null;
  loading = false;

  constructor(private http: HttpClient) {}

  testCompetitions() {
    this.loading = true;
    this.error = null;
    this.result = null;

    this.http.get('http://localhost:8087/api/competitions').subscribe({
      next: (data) => {
        this.result = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur inconnue';
        this.loading = false;
        console.error('Erreur API:', err);
      }
    });
  }

  testSms() {
    this.loading = true;
    this.error = null;
    this.result = null;

    this.http.get('http://localhost:8087/api/sms/statistics').subscribe({
      next: (data) => {
        this.result = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur inconnue';
        this.loading = false;
        console.error('Erreur SMS API:', err);
      }
    });
  }
}