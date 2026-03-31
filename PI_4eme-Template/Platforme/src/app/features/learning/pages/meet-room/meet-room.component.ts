import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { MeetService } from '@core/services/meet.service';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-meet-room',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="meet-room-page">
      <div class="meet-header">
        <button class="btn-leave" (click)="leaveMeet()">← Leave Meet</button>
        <span class="meet-title">{{ meetTitle }}</span>
      </div>
      <div id="jitsi-container" class="jitsi-container"></div>
      <div class="loading-meet" *ngIf="loading">
        <div class="spinner"></div>
        <p>Starting meet room...</p>
      </div>
    </div>
  `,
  styles: [`
    .meet-room-page {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #111;
    }
    .meet-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      background: #0F9B8E;
      color: #fff;
    }
    .btn-leave {
      background: rgba(255,255,255,0.2);
      border: none;
      color: #fff;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .btn-leave:hover { background: rgba(255,255,255,0.35); }
    .meet-title { font-weight: 600; font-size: 1rem; }
    .jitsi-container { flex: 1; width: 100%; }
    .loading-meet {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #fff;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: #0F9B8E;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class MeetRoomComponent implements OnInit, OnDestroy {
  meetTitle = 'Meet Room';
  loading = true;
  private api: any = null;
  private meetId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private meetService: MeetService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const roomName = params['room'];
      this.meetTitle = params['title'] || 'Meet Room';
      this.meetId = params['meetId'] ? +params['meetId'] : undefined;

      if (!roomName) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.loadJitsiScript(roomName);
    });
  }

  private loadJitsiScript(roomName: string): void {
    // Check if script already loaded
    if (typeof JitsiMeetExternalAPI !== 'undefined') {
      this.initJitsi(roomName);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.onload = () => this.initJitsi(roomName);
    script.onerror = () => {
      this.loading = false;
      alert('Could not load Jitsi. Check your internet connection.');
    };
    document.head.appendChild(script);
  }

  private initJitsi(roomName: string): void {
    const user = this.authService.getCurrentUser();
    const displayName = user ? `${user.prenom} ${user.nom}` : 'Guest';

    // Clean the room name — remove any URL encoding or special chars
    const cleanRoom = roomName.replace(/[^a-zA-Z0-9]/g, '');

    this.api = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName: cleanRoom,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: {
        displayName: displayName,
        email: user?.email || ''
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableLobbyChat: false,
        lobby: { autoKnock: false, enableChat: false }
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop',
          'fullscreen', 'fodeviceselection', 'hangup', 'chat',
          'raisehand', 'videoquality', 'tileview'
        ]
      }
    });

    this.loading = false;

    // Record join if student
    if (this.meetId) {
      this.meetService.recordJoin(this.meetId).subscribe();
    }

    this.api.addEventListener('videoConferenceLeft', () => {
      this.leaveMeet();
    });
  }

  leaveMeet(): void {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
    window.close();
  }

  ngOnDestroy(): void {
    if (this.api) {
      this.api.dispose();
    }
  }
}
