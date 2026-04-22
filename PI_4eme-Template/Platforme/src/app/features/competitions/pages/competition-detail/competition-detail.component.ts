import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompetitionApiService, TeamMemberDTO } from '../../services/competition-api.service';
import { Competition, Participant, Team, CompetitionStream } from '../../models/competition.model';
import { AuthService } from '../../../../core/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TeamCardsManagerComponent } from '../../components/team-cards-manager/team-cards-manager.component';
import { CompetitionChatComponent } from '../../components/competition-chat/competition-chat.component';
import { LanguageSelectorComponent } from '../../../../shared/components/language-selector/language-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { SanitizeUrlPipe } from '../../../../shared/pipes/sanitize-url.pipe';
import { StreamManagerComponent } from '../../components/stream-manager/stream-manager.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-competition-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    TeamCardsManagerComponent,
    CompetitionChatComponent,
    LanguageSelectorComponent,
    TranslateModule,
    SanitizeUrlPipe,
    StreamManagerComponent
  ],
  templateUrl: './competition-detail.component.html',
  styleUrls: ['./competition-detail.component.css']
})
export class CompetitionDetailComponent implements OnInit, AfterViewInit {
  competition: Competition | null = null;
  loading = false;
  error: string | null = null;

  isRegistered = false;
  myParticipation: Participant | null = null;
  myTeamMember: TeamMemberDTO | null = null;

  showJoinTeamModal = false;
  availableTeams: Team[] = [];
  teamForm: FormGroup;

  currentUserId: number | null = null;
  userRole: string | null = null;

  // SMS Panel
  showSmsPanel = false;
  userPhone = '';
  smsMessage = '';
  smsSending = false;

  // Map for PHYSICAL events
  private map?: L.Map;
  mapId = `event-map-${Math.random().toString(36).substr(2, 9)}`;
  private mapInitRetries = 0;
  private readonly MAX_MAP_RETRIES = 5;

  // Stream for ONLINE events
  stream: CompetitionStream | null = null;
  streamLoading = false;
  streamError: string | null = null;
  showStreamManager = false;

  private markerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private competitionService: CompetitionApiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      teamName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.idUser || null;
      this.userRole = user?.role || null;
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadCompetition(id);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  loadCompetition(id: number): void {
    this.loading = true;
    this.competitionService.getCompetitionById(id).subscribe({
      next: (data) => {
        this.competition = data;
        this.loading = false;
        this.checkRegistration(id);
        if (this.canParticipateAsTeam()) {
          this.loadTeams(id);
          this.loadMyTeam(id);
        }
        if (this.isOnlineEvent()) {
          this.loadStream(id);
        }
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement de la compétition';
        this.loading = false;
        console.error(err);
      }
    });
  }

  checkRegistration(competitionId: number): void {
    this.competitionService.getMyRegistration(competitionId).subscribe({
      next: (participant) => {
        this.myParticipation = participant;
        this.isRegistered = true;
        if ((this.isRegistered || this.isFormateur()) &&
            this.isPhysicalEvent() &&
            this.competition?.latitude &&
            this.competition?.longitude) {
          setTimeout(() => this.initMap(), 300);
        }
      },
      error: () => {
        this.myParticipation = null;
        this.isRegistered = false;
        if (this.isFormateur() &&
            this.isPhysicalEvent() &&
            this.competition?.latitude &&
            this.competition?.longitude) {
          setTimeout(() => this.initMap(), 300);
        }
      }
    });
  }

  loadTeams(competitionId: number): void {
    this.competitionService.getTeamsByCompetition(competitionId).subscribe({
      next: (teams) => {
        this.availableTeams = (teams ?? []).filter(t => t.currentMembers < t.maxMembers);
      },
      error: (err: any) => console.error('Erreur chargement équipes', err)
    });
  }

  loadMyTeam(competitionId: number): void {
    this.competitionService.getMyTeam(competitionId).subscribe({
      next: (dto) => {
        this.myTeamMember = dto;
        if (dto) {
          this.isRegistered = true;
          if (this.isOnlineEvent()) {
            this.loadStream(competitionId);
          }
          if (this.isPhysicalEvent() && this.competition?.latitude && this.competition?.longitude) {
            setTimeout(() => this.initMap(), 300);
          }
        }
      },
      error: () => { this.myTeamMember = null; }
    });
  }

  registerIndividual(): void {
    const id = this.competition?.competitionId;
    if (!id) return;

    this.competitionService.registerIndividual(id).subscribe({
      next: (participant) => {
        this.myParticipation = participant;
        this.isRegistered = true;
        alert('✅ Inscription réussie !');
        if (this.isPhysicalEvent() && this.competition?.latitude && this.competition?.longitude) {
          setTimeout(() => this.initMap(), 300);
        }
        if (this.isOnlineEvent()) {
          this.loadStream(id);
        }
      },
      error: (err: any) => {
        console.error('❌ Erreur inscription:', err);
        if (err.status === 400) {
          alert('❌ Inscription impossible : ' + (err.error?.message || 'Vérifiez que la compétition est ouverte'));
        } else {
          alert("❌ Erreur lors de l'inscription");
        }
      }
    });
  }

  cancelRegistration(): void {
    const id = this.competition?.competitionId;
    if (!id) return;
    if (!confirm("Êtes-vous sûr de vouloir annuler l'inscription ?")) return;

    this.competitionService.cancelRegistration(id).subscribe({
      next: () => {
        this.myParticipation = null;
        this.isRegistered = false;
        alert('✅ Inscription annulée');
      },
      error: (err: any) => {
        alert("❌ Erreur lors de l'annulation");
        console.error(err);
      }
    });
  }

  openJoinTeamModal(): void {
    this.showJoinTeamModal = true;
  }

  closeJoinTeamModal(): void {
    this.showJoinTeamModal = false;
  }

  joinTeam(teamId: number): void {
    if (!this.competition) return;

    this.competitionService.joinTeam(teamId).subscribe({
      next: (dto) => {
        this.myTeamMember = dto;
        this.isRegistered = true;
        this.closeJoinTeamModal();
        this.loadTeams(this.competition!.competitionId);
        if (this.isOnlineEvent()) {
          this.loadStream(this.competition!.competitionId);
        }
        alert('✅ Vous avez rejoint le groupe !');
      },
      error: (err: any) => {
        alert('❌ Erreur lors de rejoindre le groupe');
        console.error(err);
      }
    });
  }

  leaveTeam(): void {
    if (!this.myTeamMember) return;
    if (!confirm('Êtes-vous sûr de vouloir quitter le groupe ?')) return;

    this.competitionService.leaveTeam(this.myTeamMember.teamId).subscribe({
      next: () => {
        this.myTeamMember = null;
        this.isRegistered = false;
        if (this.competition) this.loadTeams(this.competition.competitionId);
        alert('✅ Vous avez quitté le groupe');
      },
      error: (err: any) => {
        alert('❌ Erreur lors de quitter le groupe');
        console.error(err);
      }
    });
  }

  canParticipateIndividual(): boolean {
    return this.competition?.participationType === 'INDIVIDUAL';
  }

  canParticipateAsTeam(): boolean {
    return this.competition?.participationType === 'TEAM';
  }

  isCompetitionOpen(): boolean {
    return this.competition?.status === 'OPEN';
  }

  isFormateur(): boolean {
    return this.userRole === 'FORMATEUR';
  }

  showRegistrationSection(): boolean {
    return !this.isFormateur();
  }

  canJoinTeam(): boolean {
    if (this.isFormateur()) return false;
    return this.isCompetitionOpen() && !this.myTeamMember;
  }

  viewLeaderboard(): void {
    if (this.competition) {
      this.router.navigate(['/competitions', this.competition.competitionId, 'leaderboard']);
    }
  }

  toggleSmsPanel(): void {
    this.showSmsPanel = !this.showSmsPanel;
  }

  saveUserPhone(): void {
    if (!this.currentUserId || !this.userPhone) {
      alert('❌ Veuillez entrer un numéro de téléphone');
      return;
    }
    this.competitionService.updateUserContact(this.currentUserId, this.userPhone, true).subscribe({
      next: () => { alert('✅ Numéro enregistré avec succès!'); },
      error: (err: any) => {
        alert("❌ Erreur lors de l'enregistrement du numéro");
        console.error(err);
      }
    });
  }

  sendTestSms(): void {
    if (!this.currentUserId || !this.smsMessage) {
      alert('❌ Veuillez entrer un message');
      return;
    }
    this.smsSending = true;
    this.competitionService.sendTestSms(this.currentUserId, this.smsMessage).subscribe({
      next: (response: any) => {
        this.smsSending = false;
        if (response.success) {
          alert('✅ SMS envoyé avec succès! SID: ' + response.smsLog.twilioSid);
          this.smsMessage = '';
        } else {
          alert("❌ Échec de l'envoi: " + response.message);
        }
      },
      error: (err: any) => {
        this.smsSending = false;
        alert("❌ Erreur lors de l'envoi du SMS");
        console.error(err);
      }
    });
  }

  // ========== STREAM ==========

  loadStream(competitionId: number): void {
    this.streamLoading = true;
    this.streamError = null;
    this.competitionService.getStream(competitionId).subscribe({
      next: (data: any) => {
        this.stream = data;
        this.streamLoading = false;
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.stream = null;
        } else {
          this.streamError = 'Erreur lors du chargement du stream';
        }
        this.streamLoading = false;
      }
    });
  }

  isOnlineEvent(): boolean {
    return this.competition?.type === 'ONLINE';
  }

  isPhysicalEvent(): boolean {
    return this.competition?.type === 'PHYSICAL';
  }

  hasStream(): boolean {
    return !!this.stream;
  }

  canViewStream(): boolean {
    return this.isOnlineEvent() && this.hasStream() && ((this.stream as any)?.canWatch || false);
  }

  getEmbedStreamUrl(): string {
    return (this.stream as any)?.embedUrl || (this.stream as any)?.streamUrl || '';
  }

  getStreamUrl(): string {
    return (this.stream as any)?.streamUrl || '';
  }

  openStreamManager(): void {
    this.showStreamManager = true;
  }

  closeStreamManager(): void {
    this.showStreamManager = false;
    if (this.competition) {
      this.loadStream(this.competition.competitionId);
    }
  }

  // ========== MAP ==========

  private initMap(): void {
    if (!this.competition?.latitude || !this.competition?.longitude) return;
    if (!this.isRegistered && !this.isFormateur()) {
      console.log('🔒 Map initialization skipped: user not registered');
      return;
    }

    const mapElement = document.getElementById(this.mapId);
    if (!mapElement) {
      this.mapInitRetries++;
      if (this.mapInitRetries < this.MAX_MAP_RETRIES) {
        console.warn(`Map element not found, retrying... (${this.mapInitRetries}/${this.MAX_MAP_RETRIES})`);
        setTimeout(() => this.initMap(), 500);
      } else {
        console.error('❌ Map element not found after max retries');
      }
      return;
    }

    this.mapInitRetries = 0;
    const lat = this.competition.latitude!;
    const lng = this.competition.longitude!;

    try {
      this.map = L.map(this.mapId, {
        center: [lat, lng] as L.LatLngTuple,
        zoom: 15
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      const marker = L.marker([lat, lng] as L.LatLngTuple, { icon: this.markerIcon }).addTo(this.map);
      const popupContent = `
        <div style="text-align: center;">
          <strong>${this.competition.title}</strong><br>
          ${this.competition.locationName || ''}<br>
          ${this.competition.locationAddress || ''}
        </div>
      `;
      marker.bindPopup(popupContent).openPopup();
      console.log('✅ Map initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing map:', error);
    }
  }
}
