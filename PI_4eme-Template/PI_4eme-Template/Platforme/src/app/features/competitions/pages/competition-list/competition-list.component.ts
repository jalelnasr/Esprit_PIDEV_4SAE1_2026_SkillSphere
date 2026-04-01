import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CompetitionApiService } from '../../services/competition-api.service';
import { Competition } from '../../models/competition.model';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageSelectorComponent } from '../../../../shared/components/language-selector/language-selector.component';
import { CompetitionMapComponent, CompetitionLocation } from '../../../../shared/components/competition-map/competition-map.component';

@Component({
  selector: 'app-competition-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelectorComponent, CompetitionMapComponent],
  templateUrl: './competition-list.component.html',
  styleUrls: ['./competition-list.component.css']
})
export class CompetitionListComponent implements OnInit {
  competitions: Competition[] = [];
  loading = false;
  error: string | null = null;
  isFormateur = false;
  viewMode: 'browse' | 'my-participations' | 'manage' = 'browse';
  showMap = false;
  allLocations: CompetitionLocation[] = [];
  myParticipationIds: Set<number> = new Set();

  constructor(
    private competitionService: CompetitionApiService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isFormateur = user?.role === 'FORMATEUR';
      const url = window.location.pathname;
      if (url.includes('my-participations')) {
        this.viewMode = 'my-participations';
      } else if (url.includes('manage')) {
        this.viewMode = 'manage';
      } else {
        this.viewMode = 'browse';
      }
      this.loadCompetitions();
      this.loadLocations();
    });
  }

  loadLocations() {
    // Charger toutes les localisations
    this.competitionService.getCompetitionLocations().subscribe({
      next: (locs) => {
        // Si apprenant, charger aussi ses participations pour colorier en bleu
        if (!this.isFormateur) {
          this.competitionService.getMyParticipations().subscribe({
            next: (myComps) => {
              const myIds = new Set(myComps.map((c: any) => c.competitionId));
              this.allLocations = locs.map((l: any) => ({
                ...l,
                isMyParticipation: myIds.has(l.competitionId)
              }));
            },
            error: () => {
              this.allLocations = locs;
            }
          });
        } else {
          this.allLocations = locs;
        }
      },
      error: () => {}
    });
  }

  toggleMap() {
    this.showMap = !this.showMap;
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
    
    let apiCall;
    
    if (this.viewMode === 'my-participations') {
      // Mes participations (apprenant)
      apiCall = this.competitionService.getMyParticipations();
      console.log('📡 API Call: getMyParticipations');
    } else if (this.viewMode === 'manage') {
      // Mes compétitions créées (formateur)
      apiCall = this.competitionService.getMyCreatedCompetitions();
      console.log('📡 API Call: getMyCreatedCompetitions');
    } else {
      // Toutes les compétitions (browse)
      apiCall = this.competitionService.getAllCompetitions();
      console.log('📡 API Call: getAllCompetitions');
    }
    
    apiCall.subscribe({
      next: (data) => {
        console.log('✅ Données reçues:', data);
        this.competitions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement des compétitions';
        this.loading = false;
      }
    });
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
