import { Component, OnInit } from '@angular/core';
import { CompetitionApiService } from '../../services/competition-api.service';
import { Competition } from '../../models/competition.model';

@Component({
  selector: 'app-manage-events',
  templateUrl: './manage-events.component.html'
})
export class ManageEventsComponent implements OnInit {
  loading = false;
  error: string | null = null;

  all: Competition[] = [];
  mine: Competition[] = [];

  constructor(private api: CompetitionApiService) {}

  ngOnInit(): void {
    this.load();
  }

  private getUserIdFromToken(): number | null {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? null;
    } catch {
      return null;
    }
  }

  load(): void {
    this.loading = true;
    this.error = null;

    const myId = this.getUserIdFromToken();

    this.api.getAllCompetitions().subscribe({
      next: (data) => {
        this.all = data ?? [];
        this.mine = myId ? this.all.filter(c => c.createdBy === myId) : [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error ?? 'Erreur lors du chargement des événements';
        this.loading = false;
      }
    });
  }

  updateStatus(c: Competition, status: string) {
    this.api.updateCompetitionStatus(c.competitionId, status).subscribe({
      next: (updated) => {
        c.status = updated.status;
      },
      error: (err) => {
        alert(err?.error ?? 'Erreur update status');
      }
    });
  }

  saveEdit(c: Competition) {
    const payload: any = {
      title: c.title,
      description: c.description,
      type: c.type,
      participationType: c.participationType,
      startDate: c.startDate,
      endDate: c.endDate,
      maxParticipants: c.maxParticipants,
      status: c.status,
      numberOfTeams: c.numberOfTeams,
      participantsPerTeam: c.participantsPerTeam
    };

    this.api.updateCompetition(c.competitionId, payload).subscribe({
      next: () => alert('✅ Événement mis à jour'),
      error: (err) => alert(err?.error ?? 'Erreur mise à jour')
    });
  }

  delete(c: Competition) {
    if (!confirm('Supprimer cet événement ?')) return;

    this.api.deleteCompetition(c.competitionId).subscribe({
      next: () => {
        this.mine = this.mine.filter(x => x.competitionId !== c.competitionId);
        this.all = this.all.filter(x => x.competitionId !== c.competitionId);
      },
      error: (err) => alert(err?.error ?? 'Erreur suppression')
    });
  }
}