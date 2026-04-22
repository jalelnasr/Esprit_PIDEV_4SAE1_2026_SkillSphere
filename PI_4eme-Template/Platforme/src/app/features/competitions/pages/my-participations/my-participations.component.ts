import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CompetitionApiService } from '../../services/competition-api.service';
import { Participant, Competition } from '../../models/competition.model';

type Row = {
  p: Participant;
  c?: Competition;
};

@Component({
  selector: 'app-my-participations',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './my-participations.component.html'
})
export class MyParticipationsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  rows: Row[] = [];

  constructor(private api: CompetitionApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    // GET /api/participants/user/{userId} → Participant[]
    this.api.getMyParticipations().pipe(
      switchMap((parts) => {
        const list = parts ?? [];
        if (list.length === 0) return of([] as Row[]);

        // Pour chaque participation, charger les détails de la compétition
        const calls = list.map(p =>
          this.api.getCompetitionById(p.competitionId).pipe(
            map(c => ({ p, c } as Row)),
            catchError(() => of({ p } as Row))
          )
        );

        return forkJoin(calls);
      })
    ).subscribe({
      next: (rows) => {
        this.rows = rows;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error ?? 'Erreur lors du chargement des participations';
        this.loading = false;
      }
    });
  }
}
