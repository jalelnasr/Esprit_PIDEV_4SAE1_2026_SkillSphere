import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CompetitionApiService } from '../../services/competition-api.service';
import { Competition } from '../../models/competition.model';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageSelectorComponent } from '../../../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-competition-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelectorComponent],
  templateUrl: './competition-list.component.html',
  styleUrls: ['./competition-list.component.css']
})
export class CompetitionListComponent implements OnInit {
  competitions: Competition[] = [];
  loading = false;
  error: string | null = null;
  isFormateur = false;
  viewMode: 'browse' | 'my-participations' | 'manage' = 'browse';

  constructor(
    private competitionService: CompetitionApiService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isFormateur = user?.role === 'FORMATEUR';
      
      // Déterminer le mode d'affichage selon la route
      const url = window.location.pathname;
      if (url.includes('my-participations')) {
        this.viewMode = 'my-participations';
      } else if (url.includes('manage')) {
        this.viewMode = 'manage';
      } else {
        this.viewMode = 'browse';
      }
      
      this.loadCompetitions();
    });
  }

  checkUserRole() {
    this.authService.currentUser$.subscribe(user => {
      this.isFormateur = user?.role === 'FORMATEUR';
    });
  }

  loadCompetitions() {
    this.loading = true;
    this.error = null;
    
    console.log('🔍 viewMode:', this.viewMode);
    console.log('🔍 isFormateur:', this.isFormateur);
    
    if (this.viewMode === 'my-participations') {
      // Mes participations → fetch all competition IDs (individual + team)
      console.log('📡 API Call: getMyAllCompetitionIds');
      this.competitionService.getMyAllCompetitionIds().subscribe({
        next: (ids: number[]) => {
          if (ids.length === 0) {
            this.competitions = [];
            this.loading = false;
            return;
          }
          Promise.all(
            ids.map(id => this.competitionService.getCompetitionById(id).toPromise())
          ).then(comps => {
            this.competitions = (comps.filter(c => c !== undefined) as Competition[]);
            this.loading = false;
          }).catch(() => {
            this.loading = false;
          });
        },
        error: (err: any) => {
          console.error('❌ Erreur:', err);
          this.error = 'Erreur lors du chargement des participations';
          this.loading = false;
        }
      });
    } else if (this.viewMode === 'manage') {
      console.log('📡 API Call: getMyCreatedCompetitions');
      this.competitionService.getMyCreatedCompetitions().subscribe({
        next: (data: Competition[]) => {
          console.log('✅ Données reçues:', data);
          this.competitions = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('❌ Erreur:', err);
          this.error = 'Erreur lors du chargement des compétitions';
          this.loading = false;
        }
      });
    } else {
      console.log('📡 API Call: getAllCompetitions');
      this.competitionService.getAllCompetitions().subscribe({
        next: (data: Competition[]) => {
          console.log('✅ Données reçues:', data);
          this.competitions = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('❌ Erreur:', err);
          this.error = 'Erreur lors du chargement des compétitions';
          this.loading = false;
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'OPEN': 'badge-success',
      'CLOSED': 'badge-danger',
      'IN_PROGRESS': 'badge-warning',
      'COMPLETED': 'badge-info',
      'CANCELLED': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getTypeBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'ONLINE': 'badge-primary',
      'PHYSICAL': 'badge-success',
      'HYBRID': 'badge-info'
    };
    return classes[type] || 'badge-secondary';
  }

  isUpcoming(competition: Competition): boolean {
    return new Date(competition.startDate) > new Date();
  }

  isActive(competition: Competition): boolean {
    const now = new Date();
    return new Date(competition.startDate) <= now && new Date(competition.endDate) >= now;
  }
}
