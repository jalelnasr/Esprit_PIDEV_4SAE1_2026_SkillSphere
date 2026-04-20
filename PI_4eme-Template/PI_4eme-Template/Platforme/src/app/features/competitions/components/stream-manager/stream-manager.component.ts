import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompetitionApiService } from '../../services/competition-api.service';
import { CompetitionStream } from '../../models/competition.model';

@Component({
  selector: 'app-stream-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="stream-manager">
      <div class="stream-header">
        <h3>🎥 Gestion du Stream</h3>
        <button class="btn-close" (click)="close.emit()">✕</button>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div *ngIf="success" class="alert alert-success">
        ✅ {{ success }}
      </div>

      <!-- Affichage du stream existant -->
      <div *ngIf="stream && !editing" class="stream-display">
        <div class="stream-info-card">
          <div class="stream-status" [class.live]="stream.isLive">
            {{ stream.isLive ? '🔴 EN DIRECT' : '⚫ HORS LIGNE' }}
          </div>
          <div class="stream-details">
            <p><strong>Titre:</strong> {{ stream.title }}</p>
            <p><strong>Plateforme:</strong> {{ stream.platform }}</p>
            <p><strong>URL:</strong> <a [href]="stream.streamUrl" target="_blank">{{ stream.streamUrl }}</a></p>
            <p *ngIf="stream.autoExpireHours"><strong>Auto-expiration:</strong> {{ stream.autoExpireHours }}h</p>
          </div>
          <div class="stream-actions">
            <button class="btn btn-primary" (click)="toggleStreamStatus()" [disabled]="actionLoading">
              {{ stream.isLive ? '⏹️ Arrêter' : '▶️ Démarrer' }}
            </button>
            <button class="btn btn-secondary" (click)="editing = true">
              ✏️ Modifier
            </button>
            <button class="btn btn-danger" (click)="confirmDelete()" [disabled]="actionLoading">
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Formulaire de création/modification -->
      <div *ngIf="!stream || editing" class="stream-form">
        <form [formGroup]="streamForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="streamUrl">URL du stream *</label>
            <input
              type="url"
              id="streamUrl"
              formControlName="streamUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              [class.invalid]="isFieldInvalid('streamUrl')"
            />
            <span class="error-message" *ngIf="isFieldInvalid('streamUrl')">
              {{ getFieldError('streamUrl') }}
            </span>
            <div class="platform-hints">
              <span class="hint">✅ YouTube</span>
              <span class="hint">✅ Twitch</span>
              <span class="hint">✅ Zoom</span>
              <span class="hint">✅ Google Meet</span>
            </div>
          </div>

          <div class="form-group">
            <label for="title">Titre du stream</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              placeholder="Ex: Live Hackathon 2026"
            />
          </div>

          <div class="form-group">
            <label for="autoExpireHours">Auto-expiration (heures)</label>
            <input
              type="number"
              id="autoExpireHours"
              formControlName="autoExpireHours"
              placeholder="Ex: 2"
              min="1"
            />
            <small class="hint-text">Le stream s'arrêtera automatiquement après ce délai</small>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cancelEdit()" *ngIf="editing">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="streamForm.invalid || actionLoading">
              {{ stream ? '💾 Mettre à jour' : '✅ Créer le stream' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .stream-manager {
      background: var(--card-bg, white);
      border-radius: 12px;
      padding: 2rem;
      max-width: 600px;
      width: 100%;
    }

    .stream-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--border-color, #e5e7eb);
    }

    .stream-header h3 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text-primary, #111827);
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary, #6b7280);
      padding: 0.5rem;
      line-height: 1;
      transition: all 0.2s ease;
    }

    .btn-close:hover {
      color: var(--text-primary, #111827);
      transform: scale(1.1);
    }

    .loading {
      text-align: center;
      padding: 2rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-left-color: #4f46e5;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .alert-danger {
      background-color: #fee;
      color: #c33;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
    }

    .stream-info-card {
      background: var(--bg-secondary, #f9fafb);
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .stream-status {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 700;
      margin-bottom: 1rem;
      background: #6b7280;
      color: white;
    }

    .stream-status.live {
      background: linear-gradient(135deg, #ff0000, #cc0000);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .stream-details p {
      margin: 0.5rem 0;
      color: var(--text-primary, #374151);
    }

    .stream-details a {
      color: #4f46e5;
      text-decoration: none;
      word-break: break-all;
    }

    .stream-details a:hover {
      color: #7c3aed;
      text-decoration: underline;
    }

    .stream-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color, #e5e7eb);
      flex-wrap: wrap;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: var(--text-primary, #111827);
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
      background-color: var(--input-bg, white);
      color: var(--text-primary, #111827);
    }

    .form-group input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .form-group input.invalid {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: block;
    }

    .platform-hints {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .hint {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      background: var(--bg-secondary, #e5e7eb);
      border-radius: 4px;
      color: var(--text-secondary, #6b7280);
    }

    .hint-text {
      display: block;
      color: var(--text-secondary, #6b7280);
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      font-size: 0.95rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      flex: 1;
      min-width: 120px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white !important;
      border: 2px solid transparent;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5);
      background: linear-gradient(135deg, #4338ca, #6d28d9);
    }

    .btn-secondary {
      background: #6b7280;
      color: white !important;
      border: 2px solid transparent;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(107, 114, 128, 0.4);
    }

    .btn-danger {
      background: #dc3545;
      color: white !important;
      border: 2px solid transparent;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
    }

    @media (max-width: 600px) {
      .stream-actions {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  `]
})
export class StreamManagerComponent implements OnInit {
  @Input() competitionId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() streamUpdated = new EventEmitter<CompetitionStream>();

  streamForm: FormGroup;
  stream: CompetitionStream | null = null;
  loading = false;
  actionLoading = false;
  error: string | null = null;
  success: string | null = null;
  editing = false;

  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionApiService
  ) {
    this.streamForm = this.fb.group({
      streamUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      title: [''],
      autoExpireHours: [null, [Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadStream();
  }

  loadStream() {
    this.loading = true;
    this.error = null;

    this.competitionService.getStream(this.competitionId).subscribe({
      next: (data) => {
        this.stream = data;
        this.loading = false;
        if (this.stream) {
          this.streamForm.patchValue({
            streamUrl: this.stream.streamUrl,
            title: this.stream.title,
            autoExpireHours: this.stream.autoExpireHours
          });
        }
      },
      error: (err) => {
        if (err.status === 404) {
          this.stream = null; // Pas de stream
        } else {
          this.error = 'Erreur lors du chargement du stream';
        }
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.streamForm.invalid) return;

    this.actionLoading = true;
    this.error = null;
    this.success = null;

    const formValue = this.streamForm.value;

    this.competitionService.createOrUpdateStream(
      this.competitionId,
      formValue.streamUrl,
      formValue.title,
      formValue.autoExpireHours
    ).subscribe({
      next: (data) => {
        this.stream = data;
        this.success = 'Stream créé avec succès !';
        this.editing = false;
        this.actionLoading = false;
        if (this.stream) {
          this.streamUpdated.emit(this.stream);
        }
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Erreur lors de la sauvegarde du stream';
        this.actionLoading = false;
      }
    });
  }

  toggleStreamStatus() {
    if (!this.stream) return;

    this.actionLoading = true;
    this.error = null;

    const action = this.stream.isLive
      ? this.competitionService.stopStream(this.competitionId)
      : this.competitionService.startStream(this.competitionId);

    action.subscribe({
      next: (data) => {
        this.stream = data;
        this.success = this.stream?.isLive ? 'Stream démarré !' : 'Stream arrêté !';
        this.actionLoading = false;
        if (this.stream) {
          this.streamUpdated.emit(this.stream);
        }
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Erreur lors du changement de statut';
        this.actionLoading = false;
      }
    });
  }

  confirmDelete() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce stream ?')) return;

    this.actionLoading = true;
    this.error = null;

    this.competitionService.deleteStream(this.competitionId).subscribe({
      next: () => {
        this.stream = null;
        this.success = 'Stream supprimé avec succès !';
        this.actionLoading = false;
        this.close.emit();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression';
        this.actionLoading = false;
      }
    });
  }

  cancelEdit() {
    this.editing = false;
    if (this.stream) {
      this.streamForm.patchValue({
        streamUrl: this.stream.streamUrl,
        title: this.stream.title,
        autoExpireHours: this.stream.autoExpireHours
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.streamForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.streamForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['pattern']) return 'URL invalide (doit commencer par http:// ou https://)';
      if (field.errors['min']) return `Valeur minimale: ${field.errors['min'].min}`;
    }
    return '';
  }
}
