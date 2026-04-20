import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StreamService, StreamData } from '../../../core/services/stream.service';

@Component({
  selector: 'app-stream-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stream-manager">
      <div class="manager-header">
        <h3>🔴 Gestion du Live Stream</h3>
        <div class="live-indicator" *ngIf="stream?.isLive">
          <span class="dot"></span> EN DIRECT
        </div>
      </div>

      <!-- Formulaire de configuration -->
      <div class="config-form" *ngIf="!stream || showConfig">
        <div class="form-group">
          <label>🔗 Lien du stream *</label>
          <input type="url" [(ngModel)]="streamUrl"
            placeholder="https://www.youtube.com/live/xxx ou https://twitch.tv/channel"
            class="form-input" />
          <small class="hint">YouTube, Twitch, Zoom, Google Meet, Discord</small>
        </div>
        <div class="form-group">
          <label>📝 Titre du stream</label>
          <input type="text" [(ngModel)]="streamTitle"
            placeholder="Ex: Live Hackathon 2026" class="form-input" />
        </div>
        <div class="form-group">
          <label>⏰ Expiration automatique (heures)</label>
          <input type="number" [(ngModel)]="autoExpireHours"
            placeholder="Ex: 4 (laisser vide = jamais)" min="1" max="24" class="form-input" />
          <small class="hint">Le stream passera OFFLINE automatiquement après ce délai</small>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" *ngIf="stream" (click)="showConfig = false">Annuler</button>
          <button class="btn-save" (click)="saveStream()" [disabled]="!streamUrl || saving">
            {{ saving ? '⏳ Enregistrement...' : '💾 Enregistrer' }}
          </button>
        </div>
      </div>

      <!-- Stream configuré -->
      <div class="stream-info" *ngIf="stream && !showConfig">
        <div class="info-row">
          <span class="info-label">Plateforme:</span>
          <span>{{ getPlatformIcon(stream.platform) }} {{ stream.platform }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Titre:</span>
          <span>{{ stream.title }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Lien:</span>
          <a [href]="stream.streamUrl" target="_blank" class="stream-link">
            {{ stream.streamUrl | slice:0:50 }}...
          </a>
        </div>
        <div class="info-row" *ngIf="stream.autoExpireHours">
          <span class="info-label">Expiration:</span>
          <span>{{ stream.autoExpireHours }}h après démarrage</span>
        </div>
        <div class="info-row" *ngIf="stream.startedAt">
          <span class="info-label">Démarré à:</span>
          <span>{{ stream.startedAt | date:'dd/MM HH:mm' }}</span>
        </div>

        <!-- Boutons de contrôle -->
        <div class="control-buttons">
          <button class="btn-start" *ngIf="!stream.isLive" (click)="startStream()" [disabled]="loading">
            {{ loading ? '⏳...' : '▶ Démarrer le Live' }}
          </button>
          <button class="btn-stop" *ngIf="stream.isLive" (click)="stopStream()" [disabled]="loading">
            {{ loading ? '⏳...' : '⏹ Arrêter le Live' }}
          </button>
          <button class="btn-edit" (click)="editStream()">✏️ Modifier</button>
          <button class="btn-delete" (click)="deleteStream()">🗑️ Supprimer</button>
        </div>
      </div>

      <!-- Messages -->
      <div class="success-msg" *ngIf="successMsg">✅ {{ successMsg }}</div>
      <div class="error-msg" *ngIf="errorMsg">❌ {{ errorMsg }}</div>
    </div>
  `,
  styles: [`
    .stream-manager {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 12px; padding: 1.5rem;
    }
    .manager-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .manager-header h3 { margin: 0; color: var(--text-primary); font-size: 1.1rem; }
    .live-indicator {
      display: flex; align-items: center; gap: 6px;
      background: #ef4444; color: white; padding: 4px 12px;
      border-radius: 20px; font-weight: 700; font-size: 12px;
    }
    .dot {
      width: 8px; height: 8px; background: white; border-radius: 50%;
      animation: blink 1s infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block; font-weight: 600; color: var(--text-primary);
      margin-bottom: 0.4rem; font-size: 0.9rem;
    }
    .form-input {
      width: 100%; padding: 0.6rem 0.8rem;
      border: 1px solid var(--border-color); border-radius: 6px;
      background: var(--bg-secondary); color: var(--text-primary);
      font-size: 0.9rem;
    }
    .hint { color: var(--text-secondary); font-size: 0.78rem; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .btn-save {
      padding: 0.6rem 1.2rem; background: #4f46e5; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-weight: 600;
    }
    .btn-cancel {
      padding: 0.6rem 1.2rem; background: var(--bg-secondary); color: var(--text-primary);
      border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer;
    }
    .info-row {
      display: flex; gap: 1rem; padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-color); font-size: 0.9rem;
      color: var(--text-primary);
    }
    .info-label { font-weight: 600; min-width: 100px; }
    .stream-link { color: #4f46e5; text-decoration: none; font-size: 0.85rem; }
    .control-buttons { display: flex; gap: 0.75rem; margin-top: 1.25rem; flex-wrap: wrap; }
    .btn-start {
      padding: 0.6rem 1.2rem; background: #10b981; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-weight: 600;
    }
    .btn-stop {
      padding: 0.6rem 1.2rem; background: #ef4444; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-weight: 600;
    }
    .btn-edit {
      padding: 0.6rem 1rem; background: var(--bg-secondary); color: var(--text-primary);
      border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer;
    }
    .btn-delete {
      padding: 0.6rem 1rem; background: #fee2e2; color: #dc2626;
      border: 1px solid #fca5a5; border-radius: 6px; cursor: pointer;
    }
    .success-msg {
      margin-top: 1rem; padding: 0.6rem 1rem; background: #d1fae5;
      color: #065f46; border-radius: 6px; font-size: 0.9rem;
    }
    .error-msg {
      margin-top: 1rem; padding: 0.6rem 1rem; background: #fee2e2;
      color: #dc2626; border-radius: 6px; font-size: 0.9rem;
    }
  `]
})
export class StreamManagerComponent implements OnInit {
  @Input() competitionId!: number;

  stream: StreamData | null = null;
  showConfig = false;
  loading = false;
  saving = false;
  streamUrl = '';
  streamTitle = '';
  autoExpireHours: number | null = null;
  successMsg = '';
  errorMsg = '';

  constructor(private streamService: StreamService) {}

  ngOnInit() {
    this.loadStream();
  }

  loadStream() {
    this.streamService.getStream(this.competitionId).subscribe({
      next: (data) => { this.stream = data; },
      error: () => { this.stream = null; }
    });
  }

  saveStream() {
    if (!this.streamUrl) return;
    this.saving = true;
    this.streamService.createStream(this.competitionId, {
      streamUrl: this.streamUrl,
      title: this.streamTitle || 'Live Stream',
      autoExpireHours: this.autoExpireHours || undefined
    }).subscribe({
      next: (data) => {
        this.stream = data;
        this.saving = false;
        this.showConfig = false;
        this.showSuccess('Stream configuré avec succès!');
      },
      error: () => {
        this.saving = false;
        this.showError('Erreur lors de la configuration');
      }
    });
  }

  startStream() {
    this.loading = true;
    this.streamService.startStream(this.competitionId).subscribe({
      next: (data) => {
        this.stream = data;
        this.loading = false;
        this.showSuccess('🔴 Stream démarré! Les participants peuvent maintenant regarder le live.');
      },
      error: () => { this.loading = false; this.showError('Erreur'); }
    });
  }

  stopStream() {
    this.loading = true;
    this.streamService.stopStream(this.competitionId).subscribe({
      next: (data) => {
        this.stream = data;
        this.loading = false;
        this.showSuccess('Stream arrêté.');
      },
      error: () => { this.loading = false; this.showError('Erreur'); }
    });
  }

  editStream() {
    if (this.stream) {
      this.streamUrl = this.stream.streamUrl;
      this.streamTitle = this.stream.title;
      this.autoExpireHours = this.stream.autoExpireHours;
    }
    this.showConfig = true;
  }

  deleteStream() {
    if (!confirm('Supprimer ce stream?')) return;
    this.streamService.deleteStream(this.competitionId).subscribe({
      next: () => { this.stream = null; this.showSuccess('Stream supprimé.'); },
      error: () => this.showError('Erreur')
    });
  }

  getPlatformIcon(platform: string): string {
    return this.streamService.getPlatformIcon(platform);
  }

  private showSuccess(msg: string) {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => this.successMsg = '', 4000);
  }

  private showError(msg: string) {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => this.errorMsg = '', 4000);
  }
}
