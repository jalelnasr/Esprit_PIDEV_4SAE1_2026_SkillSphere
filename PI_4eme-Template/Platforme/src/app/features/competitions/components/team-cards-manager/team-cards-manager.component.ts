import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionApiService } from '../../services/competition-api.service';
import { Team } from '../../models/competition.model';

interface TeamWithQualification extends Team {
  isQualified: boolean;
  isFull: boolean;
}

interface Match {
  matchId?: number;
  team1: TeamWithQualification;
  team2: TeamWithQualification;
  matchNumber: number;
  winnerTeamId?: number;
  status?: string;
}

@Component({
  selector: 'app-team-cards-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-cards-manager.component.html',
  styleUrls: ['./team-cards-manager.component.css']
})
export class TeamCardsManagerComponent implements OnInit {
  @Input() competitionId!: number;
  
  teams: TeamWithQualification[] = [];
  matches: Match[] = [];
  showDrawResult = false;
  
  // SMS Panel
  showSmsPanel = false;
  selectedTeam: TeamWithQualification | null = null;
  smsPhoneNumber = '';
  smsMessage = '';
  sendingSms = false;

  constructor(private competitionService: CompetitionApiService) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.competitionService.getTeamsByCompetition(this.competitionId).subscribe({
      next: (teams) => {
        this.teams = (teams || []).map(team => ({
          ...team,
          isQualified: false,
          isFull: team.currentMembers >= team.maxMembers
        }));
      },
      error: (err) => console.error('Erreur chargement équipes', err)
    });
  }

  toggleQualification(team: TeamWithQualification) {
    // Appeler le backend pour sauvegarder la qualification
    this.competitionService.toggleTeamQualification(team.teamId).subscribe({
      next: () => {
        // Mettre à jour l'état local après succès
        team.isQualified = !team.isQualified;
        console.log(`✅ Team ${team.teamName} qualification toggled`);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la qualification', err);
        alert('Erreur lors de la qualification de l\'équipe');
      }
    });
  }

  get qualifiedTeams(): TeamWithQualification[] {
    return this.teams.filter(t => t.isQualified);
  }

  get canDraw(): boolean {
    return this.qualifiedTeams.length >= 2 && this.qualifiedTeams.length % 2 === 0;
  }

  performDraw() {
    // Appeler le backend pour effectuer le tirage au sort
    this.competitionService.performDraw(this.competitionId).subscribe({
      next: (result) => {
        console.log('✅ Tirage au sort effectué:', result);
        
        // Mettre à jour les matchs avec les données du backend
        this.matches = result.matches.map((match: any) => ({
          matchId: match.matchId,
          team1: this.teams.find(t => t.teamId === match.team1Id)!,
          team2: this.teams.find(t => t.teamId === match.team2Id)!,
          matchNumber: match.matchNumber,
          winnerTeamId: match.winnerTeamId,
          status: match.status
        }));

        this.showDrawResult = true;
        alert(`✅ Tirage au sort effectué! ${result.matchesCreated} matchs créés.`);
      },
      error: (err) => {
        console.error('❌ Erreur lors du tirage au sort', err);
        const errorMsg = err.error?.message || 'Erreur lors du tirage au sort';
        alert(`❌ ${errorMsg}`);
      }
    });
  }

  declareMatchWinner(match: Match, winnerTeam: TeamWithQualification) {
    if (!match.matchId) {
      alert('❌ ID du match manquant');
      return;
    }

    if (!confirm(`Déclarer ${winnerTeam.teamName} comme gagnant de ce match?`)) {
      return;
    }

    this.competitionService.declareMatchWinner(match.matchId, winnerTeam.teamId).subscribe({
      next: () => {
        match.winnerTeamId = winnerTeam.teamId;
        match.status = 'COMPLETED';
        alert(`✅ ${winnerTeam.teamName} déclaré gagnant!`);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la déclaration du gagnant', err);
        alert('❌ Erreur lors de la déclaration du gagnant');
      }
    });
  }

  declareFinalWinner() {
    // Trouver les gagnants des matchs
    const winners = this.matches
      .filter(m => m.winnerTeamId)
      .map(m => m.winnerTeamId === m.team1.teamId ? m.team1 : m.team2);

    if (winners.length === 0) {
      alert('❌ Aucun gagnant de match déclaré');
      return;
    }

    // Pour l'instant, on prend le premier gagnant (tu peux améliorer ça)
    const finalWinner = winners[0];

    if (!confirm(`Déclarer ${finalWinner.teamName} comme GAGNANT FINAL de la compétition?`)) {
      return;
    }

    this.competitionService.declareFinalWinner(this.competitionId, finalWinner.teamId).subscribe({
      next: () => {
        alert(`🏆 ${finalWinner.teamName} est le GAGNANT FINAL! Félicitations!`);
        this.showDrawResult = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors de la déclaration du gagnant final', err);
        alert('❌ Erreur lors de la déclaration du gagnant final');
      }
    });
  }

  resetDraw() {
    this.matches = [];
    this.showDrawResult = false;
  }

  resetQualifications() {
    this.teams.forEach(team => team.isQualified = false);
    this.resetDraw();
  }

  // ========== SMS Functions ==========

  openSmsPanel(team: TeamWithQualification, event: Event) {
    event.stopPropagation();
    this.selectedTeam = team;
    this.smsPhoneNumber = '';
    this.smsMessage = '';
    this.showSmsPanel = true;
  }

  closeSmsPanel() {
    this.showSmsPanel = false;
    this.selectedTeam = null;
    this.smsPhoneNumber = '';
    this.smsMessage = '';
  }

  get canSendSms(): boolean {
    return this.smsPhoneNumber.trim().length > 0 && this.smsMessage.trim().length > 0;
  }

  sendSmsToWinner() {
    if (!this.canSendSms || !this.selectedTeam) return;

    this.sendingSms = true;

    this.competitionService.sendSmsToPhone(
      this.smsPhoneNumber,
      this.smsMessage,
      this.selectedTeam.teamId,
      this.competitionId
    ).subscribe({
      next: (response) => {
        alert(`✅ SMS envoyé avec succès!`);
        this.closeSmsPanel();
        this.sendingSms = false;
      },
      error: (err) => {
        console.error('❌ Erreur envoi SMS', err);
        alert('❌ Erreur lors de l\'envoi du SMS');
        this.sendingSms = false;
      }
    });
  }
}
