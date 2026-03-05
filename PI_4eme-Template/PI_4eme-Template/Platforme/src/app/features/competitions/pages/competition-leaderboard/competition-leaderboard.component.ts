import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CompetitionApiService } from '../../services/competition-api.service';
import { Competition, LeaderboardEntry } from '../../models/competition.model';

@Component({
  selector: 'app-competition-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './competition-leaderboard.component.html',
  styleUrls: ['./competition-leaderboard.component.css']
})
export class CompetitionLeaderboardComponent implements OnInit {
  competition: Competition | null = null;
  leaderboard: LeaderboardEntry[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private competitionService: CompetitionApiService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadCompetition(id);
      this.loadLeaderboard(id);
    }
  }

  loadCompetition(id: number) {
    this.competitionService.getCompetitionById(id).subscribe({
      next: (data) => {
        this.competition = data;
      },
      error: (err) => console.error('Erreur chargement compétition', err)
    });
  }

  loadLeaderboard(id: number) {
    this.loading = true;
    this.competitionService.getLeaderboard(id).subscribe({
      next: (data) => {
        this.leaderboard = data.sort((a, b) => a.rank - b.rank);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du classement';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getMedalIcon(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  }
}
