import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CompetitionApiService } from '../../services/competition-api.service';
import { Participant, Competition } from '../../models/competition.model';
import { CompetitionMapComponent, CompetitionLocation } from '../../../../shared/components/competition-map/competition-map.component';

type Row = {
  p: Participant;
  c?: Competition;
};

@Component({
  selector: 'app-my-participations',
  standalone: true,
  imports: [CommonModule, RouterModule, CompetitionMapComponent],
  templateUrl: './my-participations.component.html'
})
export class MyParticipationsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  rows: Row[] = [];
  myLocations: CompetitionLocation[] = [];
  showMap = false;

  constructor(private api: CompetitionApiService) {}

  ngOnInit(): void {
    this.load();
  }

  toggleMap() {
    this.showMap = !this.showMap;
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.api.getMyParticipations().pipe(
      switchMap((parts) => {
        const list = parts ?? [];
        if (list.length === 0) return of([] as Row[]);

        const calls = list.map(p =>
          this.api.getCompetitionById(p.competitionId).pipe(
            map(c => ({ p, c })),
            catchError(() => of({ p } as Row))
          )
        );

        return forkJoin(calls);
      })
    ).subscribe({
      next: (rows) => {
        this.rows = rows;
        this.loading = false;
        // Extraire les localisations des événements physiques
        this.myLocations = rows
          .filter(r => r.c?.latitude && r.c?.longitude && r.c?.type === 'PHYSICAL')
          .map(r => ({
            competitionId: r.c!.competitionId,
            title: r.c!.title,
            locationName: r.c!.locationName || '',
            locationAddress: r.c!.locationAddress || '',
            latitude: r.c!.latitude!,
            longitude: r.c!.longitude!,
            status: r.c!.status,
            type: r.c!.type,
            startDate: r.c!.startDate,
            isMyParticipation: true
          }));
      },
      error: (err) => {
        this.error = err?.error ?? 'Erreur lors du chargement des participations';
        this.loading = false;
      }
    });
  }
}