import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

declare var YT: any;
declare var onYouTubeIframeAPIReady: any;

interface Playlist {
  name: string;
  id: string;
  emoji: string;
}

@Component({
  selector: 'app-lofi-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lofi-player" [class.expanded]="isExpanded">

      <!-- Collapsed: just the toggle button -->
      <button class="lofi-toggle" (click)="toggleExpand()" [title]="isExpanded ? 'Minimize' : 'Study Music'">
        <span class="music-icon">{{ isPlaying ? '🎵' : '🎧' }}</span>
        <span class="playing-dot" *ngIf="isPlaying"></span>
      </button>

      <!-- Expanded panel -->
      <div class="lofi-panel" *ngIf="isExpanded">
        <div class="lofi-header">
          <span class="lofi-title">Study Music</span>
          <button class="lofi-close" (click)="toggleExpand()">×</button>
        </div>

        <!-- Playlist selector -->
        <div class="playlist-selector">
          <button
            *ngFor="let pl of playlists"
            class="pl-btn"
            [class.active]="currentPlaylist.id === pl.id"
            (click)="switchPlaylist(pl)">
            {{ pl.emoji }} {{ pl.name }}
          </button>
        </div>

        <!-- Now playing -->
        <div class="now-playing">
          <div class="vinyl" [class.spinning]="isPlaying">🎵</div>
          <div class="track-info">
            <span class="track-name">{{ currentPlaylist.name }}</span>
            <span class="track-sub">YouTube IFrame API</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="controls">
          <button class="ctrl-btn" (click)="prevTrack()" title="Previous">⏮</button>
          <button class="ctrl-btn play-btn" (click)="togglePlay()">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button class="ctrl-btn" (click)="nextTrack()" title="Next">⏭</button>
        </div>

        <!-- Volume -->
        <div class="volume-row">
          <span class="vol-icon">{{ volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊' }}</span>
          <input
            type="range"
            min="0"
            max="100"
            [(ngModel)]="volume"
            (input)="onVolumeChange()"
            class="volume-slider" />
          <span class="vol-val">{{ volume }}</span>
        </div>

        <!-- Hidden YouTube player div -->
        <div id="yt-lofi-player" style="display:none"></div>
      </div>
    </div>
  `,
  styles: [`
    .lofi-player {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    /* Toggle button */
    .lofi-toggle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0F9B8E, #0d7a70);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 4px 16px rgba(15,155,142,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .lofi-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(15,155,142,0.5); }

    .playing-dot {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 10px;
      height: 10px;
      background: #10B981;
      border-radius: 50%;
      border: 2px solid #fff;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
    }

    /* Panel */
    .lofi-panel {
      background: #1a2a2a;
      border-radius: 16px;
      padding: 1rem;
      width: 260px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      border: 1px solid rgba(15,155,142,0.3);
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .lofi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .lofi-title { color: #fff; font-weight: 700; font-size: 0.9rem; }
    .lofi-close {
      background: none; border: none; color: #888;
      font-size: 1.3rem; cursor: pointer; line-height: 1;
    }
    .lofi-close:hover { color: #fff; }

    /* Playlist selector */
    .playlist-selector {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 0.75rem;
    }
    .pl-btn {
      padding: 0.35rem 0.75rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #aaa;
      font-size: 0.8rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }
    .pl-btn:hover { background: rgba(15,155,142,0.15); color: #fff; }
    .pl-btn.active {
      background: rgba(15,155,142,0.25);
      border-color: #0F9B8E;
      color: #0F9B8E;
      font-weight: 600;
    }

    /* Now playing */
    .now-playing {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-top: 1px solid rgba(255,255,255,0.08);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 0.75rem;
    }
    .vinyl {
      font-size: 1.8rem;
      transition: transform 0.3s;
    }
    .vinyl.spinning {
      animation: spin 3s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .track-info { flex: 1; min-width: 0; }
    .track-name {
      display: block;
      color: #fff;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .track-sub { display: block; color: #666; font-size: 0.7rem; margin-top: 2px; }

    /* Controls */
    .controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .ctrl-btn {
      background: rgba(255,255,255,0.08);
      border: none;
      color: #ccc;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ctrl-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .play-btn {
      width: 44px;
      height: 44px;
      background: #0F9B8E;
      color: #fff;
      font-size: 1.1rem;
    }
    .play-btn:hover { background: #0d8a7e; }

    /* Volume */
    .volume-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .vol-icon { font-size: 1rem; }
    .volume-slider {
      flex: 1;
      -webkit-appearance: none;
      height: 4px;
      border-radius: 2px;
      background: rgba(255,255,255,0.15);
      outline: none;
      cursor: pointer;
    }
    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #0F9B8E;
      cursor: pointer;
    }
    .vol-val { color: #888; font-size: 0.75rem; min-width: 24px; text-align: right; }
  `]
})
export class LofiPlayerComponent implements OnInit, OnDestroy {
  isExpanded = false;
  isPlaying = false;
  volume = 40;
  private player: any = null;
  private apiReady = false;

  playlists: Playlist[] = [
    { name: 'Lo-fi Beats', id: 'PL6NdkXsPL07LBOz-XhgCJJGlI4jarMKzp', emoji: '☕' },
    { name: 'Jazz Study', id: 'PLlkZE8RimE_5y_ShDvC0ia0HNsi1bBXAy', emoji: '🎹' },
    { name: 'Chill Vibes', id: 'PLfkTMEJBC-QkzRF1inJmP5lQyejkHXnMn', emoji: '🌿' }
  ];

  currentPlaylist = this.playlists[0];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadYouTubeAPI();
  }

  private loadYouTubeAPI(): void {
    if ((window as any)['YT'] && (window as any)['YT'].Player) {
      this.apiReady = true;
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    (window as any)['onYouTubeIframeAPIReady'] = () => {
      this.apiReady = true;
    };
  }

  private isPlaylist(id: string): boolean {
    return id.startsWith('PL') || id.startsWith('RD') || id.startsWith('UU');
  }

  private initPlayer(): void {
    if (!this.apiReady) return;

    const isPlaylist = this.isPlaylist(this.currentPlaylist.id);

    this.player = new YT.Player('yt-lofi-player', {
      height: '0',
      width: '0',
      playerVars: isPlaylist ? {
        listType: 'playlist',
        list: this.currentPlaylist.id,
        autoplay: 1,
        loop: 1,
        controls: 0
      } : {
        videoId: this.currentPlaylist.id,
        autoplay: 1,
        loop: 1,
        controls: 0,
        playlist: this.currentPlaylist.id  // required for loop on single video
      },
      events: {
        onReady: (event: any) => {
          event.target.setShuffle(false);
          event.target.setVolume(this.volume);
          event.target.playVideo();
          this.isPlaying = true;
        },
        onStateChange: (event: any) => {
          this.isPlaying = event.data === 1;
        }
      }
    });
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded && !this.player) {
      // Wait for DOM to render the div before initializing
      setTimeout(() => this.initPlayer(), 100);
    }
  }

  togglePlay(): void {
    if (!this.player) return;
    if (this.isPlaying) {
      this.player.pauseVideo();
    } else {
      this.player.playVideo();
    }
  }

  nextTrack(): void {
    if (this.player) this.player.nextVideo();
  }

  prevTrack(): void {
    if (this.player) this.player.previousVideo();
  }

  onVolumeChange(): void {
    if (this.player) this.player.setVolume(this.volume);
  }

  switchPlaylist(pl: Playlist): void {
    this.currentPlaylist = pl;
    // Destroy old player and recreate with new playlist
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    // Small delay to let DOM settle after destroy
    setTimeout(() => this.initPlayer(), 150);
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }
}
