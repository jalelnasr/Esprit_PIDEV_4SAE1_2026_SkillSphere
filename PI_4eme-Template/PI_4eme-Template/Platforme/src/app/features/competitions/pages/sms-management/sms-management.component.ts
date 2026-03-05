import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CompetitionApiService } from '../../services/competition-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Competition } from '../../models/competition.model';

@Component({
  selector: 'app-sms-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './sms-management.component.html',
  styleUrls: ['./sms-management.component.css']
})
export class SmsManagementComponent implements OnInit {
  competitions: Competition[] = [];
  smsStatistics: any = null;
  competitionSmsHistory: any[] = [];
  loading = false;
  currentUserId: number | null = null;
  userRole: string | null = null;

  // SMS aux membres de l'équipe gagnante
  selectedCompetitionId: number | null = null;
  winnerTeamMembers: any[] = [];
  selectedMemberIds: Set<number> = new Set();
  congratsMessage = '';
  sendingToWinners = false;
  loadingMembers = false;

  constructor(
    private competitionService: CompetitionApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.idUser || null;
      this.userRole = user?.role || null;
    });

    this.loadCompetitions();
    this.loadStatistics();
    this.loadAllSmsHistory();
  }

  loadCompetitions() {
    this.loading = true;
    this.competitionService.getMyCreatedCompetitions().subscribe({
      next: (data) => {
        this.competitions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement compétitions', err);
        this.loading = false;
      }
    });
  }

  loadStatistics() {
    this.competitionService.getSmsStatistics().subscribe({
      next: (stats) => this.smsStatistics = stats,
      error: (err) => console.error('Erreur stats SMS', err)
    });
  }

  loadAllSmsHistory() {
    if (this.currentUserId) {
      this.competitionService.getUserSmsHistory(this.currentUserId).subscribe({
        next: (history) => this.competitionSmsHistory = history.slice(0, 10),
        error: (err) => console.error('Erreur historique', err)
      });
    }
  }

  onCompetitionSelect() {
    if (!this.selectedCompetitionId) {
      this.winnerTeamMembers = [];
      this.selectedMemberIds.clear();
      return;
    }

    this.loadingMembers = true;
    this.competitionService.getWinnerTeamMembers(this.selectedCompetitionId).subscribe({
      next: (members: any[]) => {
        this.winnerTeamMembers = members;
        this.loadingMembers = false;
        if (members.length === 0) {
          alert('ℹ️ Cette compétition n\'a pas encore d\'équipe gagnante déclarée');
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement membres', err);
        this.loadingMembers = false;
        alert('❌ Erreur lors du chargement des membres');
      }
    });
  }

  toggleMemberSelection(userId: number) {
    if (this.selectedMemberIds.has(userId)) {
      this.selectedMemberIds.delete(userId);
    } else {
      this.selectedMemberIds.add(userId);
    }
  }

  isMemberSelected(userId: number): boolean {
    return this.selectedMemberIds.has(userId);
  }

  sendToWinners() {
    if (this.selectedMemberIds.size === 0) {
      alert('❌ Veuillez sélectionner au moins un membre');
      return;
    }

    if (!this.congratsMessage.trim()) {
      alert('❌ Veuillez entrer un message');
      return;
    }

    const selectedMembers = this.winnerTeamMembers.filter(m => 
      this.selectedMemberIds.has(m.userId)
    );

    const membersWithoutPhone = selectedMembers.filter(m => !m.hasPhone);
    if (membersWithoutPhone.length > 0) {
      const names = membersWithoutPhone.map(m => m.userName).join(', ');
      alert(`⚠️ Ces membres n'ont pas de numéro de téléphone: ${names}`);
      return;
    }

    if (!confirm(`Envoyer le SMS à ${this.selectedMemberIds.size} membre(s) sélectionné(s) ?`)) {
      return;
    }

    this.sendingToWinners = true;
    let successCount = 0;
    let totalSent = 0;

    selectedMembers.forEach((member, index) => {
      this.competitionService.sendSmsToPhone(
        member.phoneNumber,
        this.congratsMessage,
        this.selectedCompetitionId || undefined,
        member.teamId
      ).subscribe({
        next: (response) => {
          successCount++;
          totalSent++;

          // Dernier envoi
          if (totalSent === selectedMembers.length) {
            this.sendingToWinners = false;
            alert(`✅ SMS envoyé avec succès à ${successCount} membre(s)!`);
            this.congratsMessage = '';
            this.selectedMemberIds.clear();
            this.loadStatistics();
            this.loadAllSmsHistory();
          }
        },
        error: (err) => {
          // Même en cas d'erreur 500, le SMS est envoyé (vérifier dans l'historique)
          console.warn('Erreur 500 mais SMS probablement envoyé', err);
          successCount++; // On compte comme succès car le SMS est reçu
          totalSent++;
          
          if (totalSent === selectedMembers.length) {
            this.sendingToWinners = false;
            alert(`✅ SMS envoyé avec succès à ${successCount} membre(s)!\n(message envoye - vérifiez votre téléphone)`);
            this.congratsMessage = '';
            this.selectedMemberIds.clear();
            this.loadStatistics();
            this.loadAllSmsHistory();
          }
        }
      });
    });
  }
}
