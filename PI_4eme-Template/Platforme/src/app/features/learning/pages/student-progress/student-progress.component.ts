import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormationService } from '@core/services/formation.service';
import { AuthService } from '@core/services/auth.service';
import { Subscription, filter } from 'rxjs';

interface CourseProgress {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  courseThumbnail?: string; // Optional - will be fetched separately
  completionPercent: number;
  totalLessons: number;
  completedLessons: number;
  timeSpentMinutes: number;
  status: string;
  enrolledAt: string;
  lastActivity: string;
}

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="progress-container">
      <div class="header">
        <h1>📊 Ma Progression</h1>
        <p>Suivez votre progression dans vos formations</p>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Chargement de votre progression...</p>
      </div>

      <!-- Progress Cards -->
      <div class="progress-grid" *ngIf="!loading && courses.length > 0">
        <div class="progress-card" *ngFor="let course of courses">
          <div class="card-header">
            <img 
              *ngIf="course.courseThumbnail" 
              [src]="course.courseThumbnail" 
              [alt]="course.courseTitle"
              class="course-thumb"
            >
            <div *ngIf="!course.courseThumbnail" class="course-thumb placeholder">
              📚
            </div>
            <div class="course-info">
              <h3>{{ course.courseTitle }}</h3>
              <span class="status-badge" [ngClass]="'status-' + course.status.toLowerCase()">
                {{ getStatusLabel(course.status) }}
              </span>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">Progression</span>
              <span class="progress-percent">{{ course.completionPercent }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                [style.width.%]="course.completionPercent"
                [ngClass]="{
                  'low': course.completionPercent < 30,
                  'medium': course.completionPercent >= 30 && course.completionPercent < 70,
                  'high': course.completionPercent >= 70
                }"
              ></div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <i class="fas fa-check-circle"></i>
              <div class="stat-content">
                <span class="stat-value">{{ course.completedLessons }}/{{ course.totalLessons }}</span>
                <span class="stat-label">Leçons</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <div class="stat-content">
                <span class="stat-value">{{ formatTime(course.timeSpentMinutes) }}</span>
                <span class="stat-label">Temps passé</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-calendar"></i>
              <div class="stat-content">
                <span class="stat-value">{{ formatDate(course.enrolledAt) }}</span>
                <span class="stat-label">Inscrit le</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-history"></i>
              <div class="stat-content">
                <span class="stat-value">{{ formatDate(course.lastActivity) }}</span>
                <span class="stat-label">Dernière activité</span>
              </div>
            </div>
          </div>

          <button class="btn-continue" [routerLink]="['/learning/courses', course.courseId]">
            <i class="fas fa-play"></i>
            {{ course.completionPercent === 0 ? 'Commencer' : 'Continuer' }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && courses.length === 0">
        <i class="fas fa-chart-line"></i>
        <h2>Aucune progression</h2>
        <p>Inscrivez-vous à une formation pour commencer</p>
        <button class="btn-browse" routerLink="/learning/browse">
          <i class="fas fa-search"></i>
          Parcourir les formations
        </button>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .header p {
      color: #666;
      margin: 0;
    }

    .loading {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .loading i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #0891b2;
    }

    .progress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .progress-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .progress-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .card-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: flex-start;
    }

    .course-thumb {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .course-thumb.placeholder {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .course-info {
      flex: 1;
    }

    .course-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      color: #333;
      line-height: 1.4;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.status-active {
      background: #e3f2fd;
      color: #1976d2;
    }

    .status-badge.status-completed {
      background: #e8f5e9;
      color: #388e3c;
    }

    .status-badge.status-cancelled {
      background: #ffebee;
      color: #d32f2f;
    }

    .progress-section {
      margin-bottom: 1.5rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .progress-label {
      font-size: 0.875rem;
      color: #666;
      font-weight: 500;
    }

    .progress-percent {
      font-size: 1rem;
      font-weight: 700;
      color: #0891b2;
    }

    .progress-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    .progress-fill.low {
      background: linear-gradient(90deg, #ef4444, #f87171);
    }

    .progress-fill.medium {
      background: linear-gradient(90deg, #f59e0b, #fbbf24);
    }

    .progress-fill.high {
      background: linear-gradient(90deg, #10b981, #34d399);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-item i {
      font-size: 1.25rem;
      color: #0891b2;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 0.875rem;
      font-weight: 700;
      color: #333;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #666;
    }

    .btn-continue {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-continue:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .empty-state i {
      font-size: 4rem;
      color: #0891b2;
      margin-bottom: 1rem;
    }

    .empty-state h2 {
      font-size: 1.5rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: #666;
      margin: 0 0 1.5rem 0;
    }

    .btn-browse {
      padding: 0.75rem 1.5rem;
      background: #0891b2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s ease;
    }

    .btn-browse:hover {
      background: #0e7490;
    }
  `]
})
export class StudentProgressComponent implements OnInit, OnDestroy {
  courses: CourseProgress[] = [];
  loading = true;
  private routerSubscription?: Subscription;

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProgress();
    
    // Reload data when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.includes('/learning/progress')) {
          console.log('🔄 Reloading progress data...');
          this.loadProgress();
        }
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadProgress() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.formationService.getUserEnrollments(currentUser.idUser).subscribe({
      next: (enrollments) => {
        // For each enrollment, get detailed progress
        const progressPromises = enrollments.map(enrollment =>
          this.formationService.getStudentProgress(enrollment.id).toPromise()
        );

        Promise.all(progressPromises).then(progressData => {
          this.courses = progressData
            .filter(p => p !== undefined)
            .map(p => ({
              ...p,
              courseThumbnail: undefined // Will be set if we fetch course details
            } as CourseProgress));
          
          // Optionally fetch course details for thumbnails
          this.fetchCourseThumbnails();
          
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        this.loading = false;
      }
    });
  }

  fetchCourseThumbnails() {
    // Fetch course details to get thumbnails
    this.courses.forEach(course => {
      this.formationService.getCourseById(course.courseId).subscribe({
        next: (courseDetails) => {
          course.courseThumbnail = courseDetails.thumbnailUrl;
        },
        error: (error) => {
          console.error(`Error fetching course ${course.courseId}:`, error);
        }
      });
    });
  }

  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'En cours',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }
}
