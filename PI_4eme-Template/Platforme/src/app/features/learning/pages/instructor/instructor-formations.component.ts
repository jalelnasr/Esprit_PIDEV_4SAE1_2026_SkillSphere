import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormationService } from '@core/services/formation.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { Course } from '@shared/models';
import { FormationModalComponent } from './formation-modal.component';

@Component({
  selector: 'app-instructor-formations',
  standalone: true,
  imports: [CommonModule, FormationModalComponent],
  template: `
    <div class="instructor-formations">
      <div class="header">
        <div class="header-left">
          <h1>📚 Mes Formations</h1>
          <p>Gérez vos formations et leur contenu</p>
        </div>
        <button class="btn-create" (click)="openCreateModal()">
          <i class="fas fa-plus"></i>
          Créer une Formation
        </button>
      </div>

      <!-- Formations Grid -->
      <div class="formations-grid" *ngIf="formations.length > 0 && !loading">
        <div class="formation-card" *ngFor="let formation of formations; trackBy: trackByFormationId">
          <img 
            [src]="formation.thumbnailUrl" 
            *ngIf="formation.thumbnailUrl"
            [alt]="formation.title" 
            class="formation-image"
            (error)="onImageError($event)"
          >
          <div 
            *ngIf="!formation.thumbnailUrl"
            class="formation-image formation-placeholder">
            <span>📚 Formation</span>
          </div>
          <div class="formation-info">
            <div class="formation-header">
              <h3>{{ formation.title }}</h3>
              <span class="status-badge" [ngClass]="'status-' + formation.status.toLowerCase()">
                {{ getStatusLabel(formation.status) }}
              </span>
            </div>
            <p class="description">{{ formation.description }}</p>
            
            <div class="stats">
              <span class="stat">
                <i class="fas fa-clock"></i>
                {{ formation.durationMinutes }} min
              </span>
              <span class="stat">
                <i class="fas fa-layer-group"></i>
                {{ getLevelLabel(formation.level) }}
              </span>
              <span class="stat">
                <i class="fas fa-language"></i>
                {{ getLanguageLabel(formation.language) }}
              </span>
            </div>

            <div class="actions">
              <button 
                class="btn-publish" 
                [ngClass]="formation.status === 'PUBLISHED' ? 'btn-unpublish' : 'btn-publish'"
                (click)="togglePublishStatus(formation)">
                <i class="fas" [ngClass]="formation.status === 'PUBLISHED' ? 'fa-eye-slash' : 'fa-eye'"></i>
                {{ formation.status === 'PUBLISHED' ? 'Dépublier' : 'Publier' }}
              </button>
              <button class="btn-manage" (click)="manageContent(formation.id)">
                <i class="fas fa-edit"></i>
                Gérer le Contenu
              </button>
              <button class="btn-edit" (click)="openEditModal(formation)">
                <i class="fas fa-pen"></i>
              </button>
              <button class="btn-delete" (click)="deleteFormation(formation)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="formations.length === 0 && !loading">
        <i class="fas fa-book-open"></i>
        <h2>Aucune formation</h2>
        <p>Créez votre première formation pour commencer à construire du contenu</p>
        <button class="btn-create-large" (click)="openCreateModal()">
          <i class="fas fa-plus"></i>
          Créer ma Première Formation
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Chargement de vos formations...</p>
      </div>
    </div>

    <!-- Modal -->
    <app-formation-modal
      *ngIf="showModal"
      [formation]="selectedFormation"
      (close)="closeModal()"
      (saved)="onFormationSaved($event)"
    ></app-formation-modal>
  `,
  styles: [`
    .instructor-formations {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left h1 {
      font-size: 2rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .header-left p {
      color: #666;
      font-size: 1rem;
      margin: 0;
    }

    .btn-create {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #0F9B8E, #0d8a7e);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(15, 155, 142, 0.3);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-create:hover {
      background: #0d8a7e;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 155, 142, 0.3);
    }

    .formations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .formation-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      will-change: transform;
    }

    .formation-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .formation-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: #f5f5f5;
    }

    .formation-placeholder {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }

    .formation-info {
      padding: 1.5rem;
    }

    .formation-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 0.5rem;
    }

    .formation-info h3 {
      font-size: 1.25rem;
      color: #333;
      margin: 0;
      flex: 1;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .status-draft {
      background: #f5f5f5;
      color: #666;
    }

    .status-published {
      background: #E8F5E9;
      color: #0F9B8E;
    }

    .description {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }

    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }

    .stat i {
      color: #0F9B8E;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-manage {
      flex: 1;
      padding: 0.75rem;
      background: #0F9B8E;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }

    .btn-manage:hover {
      background: #0d8a7e;
    }

    .btn-publish {
      padding: 0.75rem 1rem;
      background: #0F9B8E;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-publish:hover {
      background: #0d8a7e;
    }

    .btn-unpublish {
      padding: 0.75rem 1rem;
      background: #ff9800;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-unpublish:hover {
      background: #f57c00;
    }

    .btn-edit,
    .btn-delete {
      padding: 0.75rem;
      width: 40px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .btn-edit {
      background: #2196F3;
      color: white;
    }

    .btn-edit:hover {
      background: #1976D2;
    }

    .btn-delete {
      background: #f44336;
      color: white;
    }

    .btn-delete:hover {
      background: #d32f2f;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #999;
    }

    .empty-state i {
      font-size: 5rem;
      margin-bottom: 1.5rem;
      color: #ddd;
    }

    .empty-state h2 {
      font-size: 1.75rem;
      margin-bottom: 0.75rem;
      color: #666;
    }

    .empty-state p {
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .btn-create-large {
      padding: 1rem 2rem;
      background: #0F9B8E;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
    }

    .btn-create-large:hover {
      background: #0d8a7e;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 155, 142, 0.3);
    }

    .loading {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .loading i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #0F9B8E;
    }

    @media (max-width: 768px) {
      .instructor-formations {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .formations-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InstructorFormationsComponent implements OnInit {
  formations: Course[] = [];
  loading = true;
  showModal = false;
  selectedFormation?: Course;

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.loading = true;
    
    this.authService.currentUser$.subscribe(currentUser => {
      if (!currentUser) {
        console.log('❌ No current user found');
        this.loading = false;
        return;
      }

      console.log('👤 Current user ID:', currentUser.idUser);

      // Charger toutes les formations et filtrer côté frontend
      this.formationService.getCourses().subscribe({
        next: (courses: Course[]) => {
          console.log('📚 All formations received:', courses.length);
          console.log('📋 Sample formation:', courses[0]);
          
          // Filtrer pour ne garder que les formations du formateur
          this.formations = courses.filter(f => {
            console.log(`Comparing: formation.createdBy (${f.createdBy}) === currentUser.idUser (${currentUser.idUser})`);
            return f.createdBy === currentUser.idUser;
          });
          
          console.log('✅ Filtered formations for instructor:', this.formations.length);
          console.log('📋 Instructor formations:', this.formations);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading formations:', error);
          this.toastService.error('Erreur lors du chargement des formations');
          this.formations = [];
          this.loading = false;
        }
      });
    });
  }

  openCreateModal(): void {
    this.selectedFormation = undefined;
    this.showModal = true;
  }

  openEditModal(formation: Course): void {
    this.selectedFormation = formation;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedFormation = undefined;
  }

  onFormationSaved(formation: Course): void {
    this.loadFormations();
  }

  manageContent(formationId: number): void {
    this.router.navigate(['/learning/instructor/content', formationId]);
  }

  deleteFormation(formation: Course): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${formation.title}" ?`)) {
      return;
    }

    this.formationService.deleteCourse(formation.id).subscribe({
      next: () => {
        this.toastService.success('Formation supprimée avec succès');
        this.loadFormations();
      },
      error: (error: any) => {
        console.error('Error deleting formation:', error);
        this.toastService.error('Erreur lors de la suppression');
      }
    });
  }

  togglePublishStatus(formation: Course): void {
    const isPublished = formation.status === 'PUBLISHED';
    const action = isPublished ? 'dépublier' : 'publier';
    
    if (!confirm(`Voulez-vous ${action} "${formation.title}" ?`)) {
      return;
    }

    const serviceCall = isPublished 
      ? this.formationService.unpublishCourse(formation.id)
      : this.formationService.publishCourse(formation.id);

    serviceCall.subscribe({
      next: () => {
        this.toastService.success(`Formation ${isPublished ? 'dépubliée' : 'publiée'} avec succès`);
        this.loadFormations();
      },
      error: (error: any) => {
        console.error('Error toggling publish status:', error);
        this.toastService.error(`Erreur lors de la ${isPublished ? 'dépublication' : 'publication'}`);
      }
    });
  }

  getStatusLabel(status: string): string {
    return status === 'PUBLISHED' ? 'Publiée' : 'Brouillon';
  }

  getLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'BEGINNER': 'Débutant',
      'INTERMEDIATE': 'Intermédiaire',
      'ADVANCED': 'Avancé'
    };
    return labels[level] || level;
  }

  getLanguageLabel(language: string): string {
    const labels: { [key: string]: string } = {
      'fr': 'Français',
      'en': 'Anglais',
      'ar': 'Arabe'
    };
    return labels[language] || language;
  }

  onImageError(event: any): void {
    // Utiliser un gradient CSS au lieu d'une URL externe
    const parent = event.target.parentElement;
    if (parent) {
      event.target.style.display = 'none';
      parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      parent.style.display = 'flex';
      parent.style.alignItems = 'center';
      parent.style.justifyContent = 'center';
      parent.style.color = 'white';
      parent.style.fontSize = '24px';
      parent.style.fontWeight = 'bold';
      parent.innerHTML = '<span>📚 Formation</span>';
    }
  }

  trackByFormationId(index: number, formation: Course): number {
    return formation.id;
  }
}

