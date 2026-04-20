import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-diagnostic-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem; font-family: monospace;">
      <h1>🔍 DIAGNOSTIC COMPETITION DETAIL</h1>
      
      <div style="background: #f0f0f0; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
        <h3>📋 Informations de base</h3>
        <p><strong>ID de la route:</strong> {{ competitionId }}</p>
        <p><strong>URL complète:</strong> {{ fullUrl }}</p>
        <p><strong>État du chargement:</strong> {{ loading ? '⏳ En cours...' : '✅ Terminé' }}</p>
      </div>

      <div *ngIf="error" style="background: #ffe6e6; padding: 1rem; margin: 1rem 0; border-radius: 8px; color: #d8000c;">
        <h3>❌ ERREUR</h3>
        <pre>{{ error }}</pre>
      </div>

      <div *ngIf="competition" style="background: #e6ffe6; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
        <h3>✅ COMPÉTITION CHARGÉE</h3>
        <pre>{{ competition | json }}</pre>
      </div>

      <div *ngIf="!loading && !competition && !error" style="background: #fff3cd; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
        <h3>⚠️ AUCUNE DONNÉE</h3>
        <p>Le chargement est terminé mais aucune compétition n'a été chargée.</p>
      </div>

      <div style="background: #e6f3ff; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
        <h3>🔧 LOGS</h3>
        <div *ngFor="let log of logs" style="margin: 5px 0;">
          <span style="color: #666;">{{ log.time }}</span> - {{ log.message }}
        </div>
      </div>

      <button (click)="reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
        🔄 Recharger
      </button>
    </div>
  `
})
export class DiagnosticDetailComponent implements OnInit {
  competitionId: string | null = null;
  fullUrl = '';
  loading = false;
  error: string | null = null;
  competition: any = null;
  logs: Array<{time: string, message: string}> = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fullUrl = window.location.href;
    this.addLog('Component initialized');
    
    this.competitionId = this.route.snapshot.paramMap.get('id');
    this.addLog(`Route ID: ${this.competitionId}`);
    
    if (this.competitionId) {
      this.loadCompetition(Number(this.competitionId));
    } else {
      this.error = 'ID de compétition manquant dans la route';
      this.addLog('ERROR: No competition ID in route');
    }
  }

  loadCompetition(id: number) {
    this.loading = true;
    this.addLog(`Starting API call for competition ${id}`);
    
    const url = `http://localhost:8087/api/competitions/${id}`;
    this.addLog(`URL: ${url}`);

    this.http.get(url).subscribe({
      next: (data) => {
        this.competition = data;
        this.loading = false;
        this.addLog('✅ Competition loaded successfully');
        console.log('Competition data:', data);
      },
      error: (err) => {
        this.error = JSON.stringify(err, null, 2);
        this.loading = false;
        this.addLog(`❌ Error: ${err.message}`);
        console.error('Error loading competition:', err);
      }
    });
  }

  reload() {
    this.logs = [];
    this.error = null;
    this.competition = null;
    this.ngOnInit();
  }

  addLog(message: string) {
    const time = new Date().toLocaleTimeString();
    this.logs.push({ time, message });
    console.log(`[${time}] ${message}`);
  }
}
