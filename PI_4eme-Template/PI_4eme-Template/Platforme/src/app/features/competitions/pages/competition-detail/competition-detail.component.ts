import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompetitionApiService, TeamMemberDTO } from '../../services/competition-api.service';
import { Competition, Participant, Team } from '../../models/competition.model';
import { AuthService } from '../../../../core/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TeamCardsManagerComponent } from '../../components/team-cards-manager/team-cards-manager.component';
import { CompetitionChatComponent } from '../../components/competition-chat/competition-chat.component';
import { LanguageSelectorComponent } from '../../../../shared/components/language-selector/language-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { CompetitionMapComponent } from '../../../../shared/components/competition-map/competition-map.component';

@Component({
  selector: 'app-competition-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, TeamCardsManagerComponent, CompetitionChatComponent, LanguageSelectorComponent, TranslateModule, CompetitionMapComponent],
  templateUrl: './competition-detail.component.html',
  styleUrls: ['./competition-detail.component.css']
})
export class CompetitionDetailComponent implements OnInit {
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

  loadCompetition(id: number) {
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
      },
      error: (err) => {
        // 404 = pas inscrit
        this.myParticipation = null;
        this.isRegistered = false;
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
      },
      error: (err) => {
        alert("❌ Erreur lors de l'inscription");
        console.error(err);
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
}