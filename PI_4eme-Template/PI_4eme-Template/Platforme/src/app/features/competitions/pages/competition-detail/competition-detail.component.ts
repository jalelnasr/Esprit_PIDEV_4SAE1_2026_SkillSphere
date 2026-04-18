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

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.idUser || null;
      this.userRole = user?.role || null;
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadCompetition(id);
  }

  ngAfterViewInit() {
    // Map will be initialized after competition data is loaded
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadCompetition(id: number) {
    this.loading = true;
    this.competitionService.getCompetitionById(id).subscribe({
      next: (data) => {
        this.competition = data;
        this.loading = false;

        // Check registration first, then initialize map/stream
        this.checkRegistration(id);

        if (this.canParticipateAsTeam()) {
          this.loadTeams(id);
          this.loadMyTeam(id);
        }

        // Load stream for ONLINE events (will check canWatch in backend)
        if (this.isOnlineEvent()) {
          this.loadStream(id);
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la compétition';
        this.loading = false;
        console.error(err);
      }
    });
  }

  checkRegistration(competitionId: number) {
    this.competitionService.getMyRegistration(competitionId).subscribe({
      next: (participant) => {
        this.myParticipation = participant;
        this.isRegistered = true;
        
        // ✅ Initialize map ONLY if registered or formateur
        if ((this.isRegistered || this.isFormateur()) && 
            this.isPhysicalEvent() && 
            this.competition?.latitude && 
            this.competition?.longitude) {
          setTimeout(() => this.initMap(), 300);
        }
      },
      error: () => {
        // 404 = pas inscrit
        this.myParticipation = null;
        this.isRegistered = false;
        
        // ✅ Initialize map for formateur even if not registered
        if (this.isFormateur() && 
            this.isPhysicalEvent() && 
            this.competition?.latitude && 
            this.competition?.longitude) {
          setTimeout(() => this.initMap(), 300);
        }
      }
    });
  }

  loadTeams(competitionId: number) {
    this.competitionService.getTeamsByCompetition(competitionId).subscribe({
      next: (teams) => {
        this.availableTeams = (teams ?? []).filter(t => t.currentMembers < t.maxMembers);
      },
      error: (err) => console.error('Erreur chargement équipes', err)
    });
  }

  loadMyTeam(competitionId: number) {
    this.competitionService.getMyTeam(competitionId).subscribe({
      next: (dto) => this.myTeamMember = dto,
      error: () => this.myTeamMember = null
    });
  }

  registerIndividual() {
    const id = this.competition?.competitionId;
    if (!id) return;

    this.competitionService.registerIndividual(id).subscribe({
      next: (participant) => {
        this.myParticipation = participant;
        this.isRegistered = true;
        alert('✅ Inscription réussie !');
        
        // ✅ Initialize map after registration for PHYSICAL events
        if (this.isPhysicalEvent() && this.competition?.latitude && this.competition?.longitude) {
          setTimeout(() => this.initMap(), 300);
        }
        
        // ✅ Reload stream for ONLINE events to get canWatch=true
        if (this.isOnlineEvent()) {
          this.loadStream(id);
        }
      },
      error: (err) => {
        console.error('❌ Erreur inscription:', err);
        if (err.status === 400) {
          alert("❌ Inscription impossible : " + (err.error?.message || "Vérifiez que la compétition est ouverte"));
        } else {
          alert("❌ Erreur lors de l'inscription");
        }
      }
    });
  }

  cancelRegistration() {
    const id = this.competition?.competitionId;
    if (!id) return;
    if (!confirm("Êtes-vous sûr de vouloir annuler l'inscription ?")) return;

    this.competitionService.cancelRegistration(id).subscribe({
      next: () => {
        this.myParticipation = null;
        this.isRegistered = false;
        alert('✅ Inscription annulée');
      },
      error: (err) => {
        alert("❌ Erreur lors de l'annulation");
        console.error(err);
      }
    });
  }

  openJoinTeamModal() {
    this.showJoinTeamModal = true;
  }

  closeJoinTeamModal() {
    this.showJoinTeamModal = false;
  }

  joinTeam(teamId: number) {
    if (!this.competition) return;

    this.competitionService.joinTeam(teamId).subscribe({
      next: (dto) => {
        this.myTeamMember = dto;
        this.closeJoinTeamModal();
        this.loadTeams(this.competition!.competitionId);
        alert("✅ Vous avez rejoint le groupe !");
      },
      error: (err) => {
        alert("❌ Erreur lors de rejoindre le groupe");
        console.error(err);
      }
    });
  }

  leaveTeam() {
    if (!this.myTeamMember) return;
    if (!confirm("Êtes-vous sûr de vouloir quitter le groupe ?")) return;

    this.competitionService.leaveTeam(this.myTeamMember.teamId).subscribe({
      next: () => {
        this.myTeamMember = null;
        if (this.competition) this.loadTeams(this.competition.competitionId);
        alert("✅ Vous avez quitté le groupe");
      },
      error: (err) => {
        alert("❌ Erreur lors de quitter le groupe");
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

  viewLeaderboard() {
    if (this.competition) {
      this.router.navigate(['/competitions', this.competition.competitionId, 'leaderboard']);
    }
  }

  toggleSmsPanel() {
    this.showSmsPanel = !this.showSmsPanel;
  }

  saveUserPhone() {
    if (!this.currentUserId || !this.userPhone) {
      alert('❌ Veuillez entrer un numéro de téléphone');
      return;
    }

    this.competitionService.updateUserContact(this.currentUserId, this.userPhone, true).subscribe({
      next: () => {
        alert('✅ Numéro enregistré avec succès!');
      },
      error: (err) => {
        alert('❌ Erreur lors de l\'enregistrement du numéro');
        console.error(err);
      }
    });
  }

  sendTestSms() {
    if (!this.currentUserId || !this.smsMessage) {
      alert('❌ Veuillez entrer un message');
      return;
    }

    this.smsSending = true;
    this.competitionService.sendTestSms(this.currentUserId, this.smsMessage).subscribe({
      next: (response) => {
        this.smsSending = false;
        if (response.success) {
          alert('✅ SMS envoyé avec succès! SID: ' + response.smsLog.twilioSid);
          this.smsMessage = '';
        } else {
          alert('❌ Échec de l\'envoi: ' + response.message);
        }
      },
      error: (err) => {
        this.smsSending = false;
        alert('❌ Erreur lors de l\'envoi du SMS');
        console.error(err);
      }
    });
  }

  // ========== STREAM & MAP HELPERS ==========

  loadStream(competitionId: number) {
    this.streamLoading = true;
    this.streamError = null;
    
    this.competitionService.getStream(competitionId).subscribe({
      next: (data) => {
        this.stream = data;
        this.streamLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.stream = null; // Pas de stream configuré
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
    return this.isOnlineEvent() && this.hasStream() && (this.stream?.canWatch || false);
  }

  getEmbedStreamUrl(): string {
    return this.stream?.embedUrl || this.stream?.streamUrl || '';
  }

  getStreamUrl(): string {
    return this.stream?.streamUrl || '';
  }

  openStreamManager(): void {
    this.showStreamManager = true;
  }

  closeStreamManager(): void {
    this.showStreamManager = false;
    // Recharger le stream après modification
    if (this.competition) {
      this.loadStream(this.competition.competitionId);
    }
  }

  private mapInitRetries = 0;
  private readonly MAX_MAP_RETRIES = 5;

  private initMap(): void {
    if (!this.competition?.latitude || !this.competition?.longitude) return;
    
    // ✅ Only initialize if registered or formateur
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

    // Reset retry counter
    this.mapInitRetries = 0;

    const lat = this.competition.latitude;
    const lng = this.competition.longitude;

    try {
      this.map = L.map(this.mapId, {
        center: [lat, lng] as L.LatLngTuple,
        zoom: 15
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Add marker
      const marker = L.marker(
        [lat, lng] as L.LatLngTuple,
        { icon: this.markerIcon }
      ).addTo(this.map);

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