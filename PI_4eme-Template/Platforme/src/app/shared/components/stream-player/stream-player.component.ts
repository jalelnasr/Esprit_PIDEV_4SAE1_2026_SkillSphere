import { Component, Input, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StreamService, StreamData } from '../../../core/services/stream.service';

@Component({
  selector: 'app-stream-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stream-container" *ngIf="stream">

      <!-- Badge LIVE -->
      <div class="stream-header">
        <div class="live-badge" *ngIf="stream.isLive">
          <span class="live-dot"></span> LIVE
        </div>
        <div class="offline-badge" *ngIf="!stream.isLive">
          ⚫ OFFLINE
        </div>
        <span class="stream-title">{{ stream.title }}</span>
        <span class="platform-badge">{{ getPlatformIcon(stream.platform) }} {{ stream.platform }}</span>
      </div>

      <!-- Accès refusé: pas participant -->
      <div class="access-denied" *ngIf="stream.isLive && !stream.canWatch">
        <span class="lock-icon">🔒</span>
        <h4>Accès réservé aux participants</h4>
        <p>Vous devez être inscrit à cette compétition pour accéder au live stream.</p>
        <small>Inscrivez-vous à la compétition pour regarder le live.</small>
      </div>

      <!-- Player intégré (YouTube/Twitch) - seulement si participant -->
      <div class="player-wrapper" *ngIf="stream.isLive && embedUrl && isEmbeddable && stream.canWatch">
        <iframe
          [src]="embedUrl"
          frameborder="0"
          allowfullscreen
          allow="autoplay; encrypted-media"
          class="stream-iframe">
        </iframe>
      </div>

      <!-- Zoom/Meet/Discord ou lien externe - seulement si participant -->
      <div class="external-link-wrapper" *ngIf="stream.isLive && !isEmbeddable && stream.canWatch">
        <div class="external-info">
          <span class="ext-icon">{{ getPlatformIcon(stream.platform) }}</span>
          <div>
            <p *ngIf="stream.platform === 'DISCORD'">Rejoignez le serveur Discord pour suivre le live</p>
            <p *ngIf="stream.platform === 'ZOOM'">Ce live se déroule sur Zoom</p>
            <p *ngIf="stream.platform === 'MEET'">Ce live se déroule sur Google Meet</p>
            <p *ngIf="stream.platform === 'OTHER'">Ce stream s'ouvre dans une application externe</p>
            <small>{{ stream.streamUrl }}</small>
          </div>
        </div>
        <a [href]="stream.streamUrl" target="_blank"
           [class]="stream.platform === 'DISCORD' ? 'btn-join-discord' : 'btn-join-live'">
          <span *ngIf="stream.platform === 'DISCORD'">💬 Rejoindre sur Discord</span>
          <span *ngIf="stream.platform === 'ZOOM'">📹 Rejoindre sur Zoom</span>
          <span *ngIf="stream.platform === 'MEET'">📞 Rejoindre sur Meet</span>
          <span *ngIf="stream.platform === 'OTHER'">🔗 Rejoindre le Live</span>
        </a>
      </div>

      <!-- Offline message -->
      <div class="offline-message" *ngIf="!stream.isLive">
        <span class="offline-icon">📺</span>
        <p>Le stream n'est pas encore démarré</p>
        <small *ngIf="stream.startedAt">Dernier live: {{ stream.startedAt | date:'dd/MM/yyyy HH:mm' }}</small>
      </div>

      <!-- Actions -->
      <div class="stream-actions" *ngIf="stream.isLive && stream.canWatch">
        <a [href]="stream.streamUrl" target="_blank" class="btn-external">
          ↗ Ouvrir dans un nouvel onglet
        </a>
      </div>
    </div>

    <!-- Pas de stream configuré -->
    <div class="no-stream" *ngIf="!stream && !loading">
      <span>📺</span>
      <p>Aucun stream configuré pour cet événement</p>
    </div>

    <div class="loading" *ngIf="loading">
      <div class="spinner-small"></div>
    </div>
  `,
  styles: [`
    .stream-container {
      background: #0f0f0f; border-radius: 12px; overflow: hidden;
      border: 1px solid #333;
    }
    .stream-header {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px; background: #1a1a1a;
      flex-wrap: wrap;
    }
    .live-badge {
      display: flex; align-items: center; gap: 6px;
      background: #ef4444; color: white; padding: 4px 10px;
      border-radius: 4px; font-weight: 700; font-size: 12px;
    }
    .live-dot {
      width: 8px; height: 8px; background: white;
      border-radius: 50%; animation: blink 1s infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .offline-badge {
      background: #374151; color: #9ca3af; padding: 4px 10px;
      border-radius: 4px; font-size: 12px; font-weight: 600;
    }
    .stream-title { color: white; font-weight: 600; flex: 1; font-size: 14px; }
    .platform-badge {
      background: #374151; color: #d1d5db; padding: 3px 8px;
      border-radius: 4px; font-size: 12px;
    }
    .access-denied {
      padding: 40px 24px; text-align: center; background: #1a1a1a;
    }
    .lock-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
    .access-denied h4 { color: #f9fafb; margin: 0 0 8px; font-size: 1.1rem; }
    .access-denied p { color: #9ca3af; margin: 0 0 6px; }
    .access-denied small { color: #6b7280; font-size: 12px; }
    .player-wrapper {
      position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;
    }
    .stream-iframe {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    }
    .external-link-wrapper {
      padding: 24px; display: flex; flex-direction: column;
      align-items: center; gap: 16px; background: #111;
    }
    .external-info {
      display: flex; align-items: center; gap: 16px; color: white;
    }
    .ext-icon { font-size: 3rem; }
    .external-info p { margin: 0; font-weight: 600; }
    .external-info small { color: #9ca3af; font-size: 12px; }
    .btn-join-live {
      padding: 12px 24px; background: #4f46e5; color: white;
      border-radius: 8px; text-decoration: none; font-weight: 700;
      font-size: 16px; transition: background 0.2s;
    }
    .btn-join-live:hover { background: #4338ca; }
    .btn-join-discord {
      padding: 12px 24px; background: #5865F2; color: white;
      border-radius: 8px; text-decoration: none; font-weight: 700;
      font-size: 16px; transition: background 0.2s;
    }
    .btn-join-discord:hover { background: #4752c4; }
    .offline-message {
      padding: 32px; text-align: center; color: #6b7280;
    }
    .offline-icon { font-size: 3rem; display: block; margin-bottom: 8px; }
    .offline-message p { margin: 0; font-size: 16px; }
    .offline-message small { font-size: 12px; }
    .stream-actions {
      padding: 8px 16px; background: #1a1a1a;
      display: flex; justify-content: flex-end;
    }
    .btn-external {
      color: #9ca3af; font-size: 12px; text-decoration: none;
    }
    .btn-external:hover { color: white; }
    .no-stream {
      padding: 24px; text-align: center; color: #6b7280;
      background: var(--card-bg); border-radius: 12px;
      border: 1px dashed var(--border-color);
    }
    .no-stream span { font-size: 2rem; display: block; margin-bottom: 8px; }
    .loading { padding: 16px; text-align: center; }
    .spinner-small {
      width: 24px; height: 24px; border: 3px solid #e5e7eb;
      border-left-color: #4f46e5; border-radius: 50%;
      animation: spin 1s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class StreamPlayerComponent implements OnInit, OnDestroy {
  @Input() competitionId!: number;
  @Input() isParticipant: boolean = false; // passé depuis le parent

  stream: StreamData | null = null;
  loading = false;
  embedUrl: SafeResourceUrl | null = null;
  isEmbeddable = false;
  private refreshInterval: any;

  constructor(
    private streamService: StreamService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadStream();
    // Rafraîchir toutes les 30 secondes pour détecter si le stream démarre
    if (isPlatformBrowser(this.platformId)) {
      this.refreshInterval = setInterval(() => this.loadStream(), 30000);
    }
  }

  loadStream() {
    this.loading = true;
    this.streamService.getStream(this.competitionId).subscribe({
      next: (data) => {
        this.stream = data;
        // Si le parent confirme que l'utilisateur est participant, forcer canWatch = true
        if (this.isParticipant) {
          this.stream.canWatch = true;
        }
        this.loading = false;
        if (data.embedUrl) {
          this.isEmbeddable = data.platform === 'YOUTUBE' || data.platform === 'TWITCH';
          this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.embedUrl);
        }
      },
      error: () => {
        this.stream = null;
        this.loading = false;
      }
    });
  }

  getPlatformIcon(platform: string): string {
    return this.streamService.getPlatformIcon(platform);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
}
