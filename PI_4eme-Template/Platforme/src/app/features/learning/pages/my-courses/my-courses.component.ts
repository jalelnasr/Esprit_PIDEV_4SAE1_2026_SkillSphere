import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormationService, CourseRatingStats, CourseReview, ReviewRequest } from '@core/services/formation.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { Enrollment, Course } from '@shared/models/formation.model';
import { MeetSidebarComponent } from '@shared/components/meet-sidebar/meet-sidebar.component';

interface EnrolledCourse {
  enrollment: Enrollment;
  course: Course;
  ratingStats?: CourseRatingStats;
  myReview?: CourseReview | null;
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MeetSidebarComponent],
  template: `
    <div class="my-courses-page-layout">
      <!-- LEFT: existing content (unchanged) -->
      <div class="my-courses-main">
    <div class="my-courses-container">
      <!-- Back Button -->
      <button class="back-btn" (click)="goBack()" title="Retour">
        <span class="back-icon">←</span>
      </button>

      <div class="header">
        <div class="header-left">
          <h1>📚 Mes Formations</h1>
          <p>Formations auxquelles vous êtes inscrit</p>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Chargement de vos formations...</p>
      </div>

      <!-- Courses Grid -->
      <div class="courses-grid" *ngIf="!loading && enrolledCourses.length > 0">
        <div class="course-card" *ngFor="let item of enrolledCourses">
          <div class="enrolled-badge">✓ Inscrit</div>
          <img 
            *ngIf="item.course.thumbnailUrl"
            [src]="item.course.thumbnailUrl" 
            [alt]="item.course.title" 
            class="course-image"
          >
          <div 
            *ngIf="!item.course.thumbnailUrl"
            class="course-image course-placeholder">
            <span>📚</span>
          </div>
          <div class="course-info">
            <h3>{{ item.course.title }}</h3>
            <p class="description">{{ item.course.description }}</p>
            
            <div class="stats">
              <span class="stat">
                <i class="fas fa-clock"></i>
                {{ item.course.durationMinutes }} min
              </span>
              <span class="stat">
                <i class="fas fa-layer-group"></i>
                {{ item.course.level }}
              </span>
              <span class="stat">
                <i class="fas fa-language"></i>
                {{ item.course.language }}
              </span>
            </div>

            <div class="enrollment-info">
              <span class="enrollment-date">
                <i class="fas fa-calendar"></i>
                Inscrit le {{ item.enrollment.inscriptionDate | date:'dd/MM/yyyy' }}
              </span>
              <span class="enrollment-status" [ngClass]="'status-' + item.enrollment.status.toLowerCase()">
                {{ getStatusLabel(item.enrollment.status) }}
              </span>
            </div>
            
            <!-- Rating Widget -->
            <div class="rating-widget" *ngIf="item.ratingStats">
              <div class="rating-display">
                <span class="stars">
                  <ng-container *ngFor="let filled of getStarsArray(item.ratingStats.averageRating)">
                    {{ filled ? '★' : '☆' }}
                  </ng-container>
                </span>
                <span class="rating-text">
                  ({{ item.ratingStats.averageRating.toFixed(1) }} / {{ item.ratingStats.totalReviews }} avis)
                </span>
              </div>
              <button class="btn-review" (click)="openReviewModal(item.course.id, $event)">
                {{ item.myReview ? '✏️ Modifier mon avis' : '⭐ Donner mon avis' }}
              </button>
            </div>

            <button class="btn-access" (click)="accessCourse(item.course.id, $event)">
              <i class="fas fa-play"></i>
              Accéder au cours
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && enrolledCourses.length === 0">
        <i class="fas fa-book-open"></i>
        <h2>Aucune formation</h2>
        <p>Vous n'êtes inscrit à aucune formation pour le moment</p>
        <button class="btn-browse" routerLink="/learning/browse">
          <i class="fas fa-search"></i>
          Parcourir les formations
        </button>
      </div>
    </div>
    </div>

    <!-- RIGHT: Meet Sidebar -->
    <app-meet-sidebar [isFormateur]="false"></app-meet-sidebar>
    </div>

    <!-- Review Modal -->
    <div class="modal-overlay" *ngIf="showReviewModal" (click)="closeReviewModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>⭐ Donner votre avis</h3>
          <button class="close-btn" (click)="closeReviewModal()">×</button>
        </div>
        
        <div class="modal-body">
          <div class="rating-input">
            <label>Votre note</label>
            <div class="stars-input">
              <span *ngFor="let star of [1,2,3,4,5]" 
                    class="star-input"
                    (click)="setRating(star)"
                    (mouseenter)="hoverRating = star"
                    (mouseleave)="hoverRating = 0">
                {{ (hoverRating >= star || reviewRating >= star) ? '★' : '☆' }}
              </span>
            </div>
          </div>
          
          <div class="comment-input">
            <label>Votre commentaire (optionnel)</label>
            <textarea 
              [(ngModel)]="reviewComment" 
              placeholder="Partagez votre expérience..."
              rows="4"
              maxlength="500"></textarea>
            <span class="char-count">{{ reviewComment.length }}/500</span>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-cancel" (click)="closeReviewModal()">Annuler</button>
          <button class="btn-submit" (click)="submitReview()" [disabled]="reviewRating === 0 || submittingReview">
            {{ submittingReview ? 'Envoi...' : 'Publier' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-courses-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
    }

    .back-btn {
      position: fixed;
      top: 80px;
      left: 20px;
      z-index: 100;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid #0891b2;
      background: white;
      color: #0891b2;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .back-btn:hover {
      background: #0891b2;
      color: white;
      transform: translateX(-4px);
    }

    .header {
      margin-bottom: 2rem;
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

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .course-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      position: relative;
    }

    .course-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .enrolled-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #4CAF50;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }

    .course-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: #f5f5f5;
    }

    .course-placeholder {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
    }

    .course-info {
      padding: 1.5rem;
    }

    .course-info h3 {
      font-size: 1.25rem;
      color: #333;
      margin: 0 0 0.75rem 0;
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
      color: #0891b2;
    }

    .enrollment-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .enrollment-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }

    .enrollment-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-active {
      background: #E8F5E9;
      color: #4CAF50;
    }

    .status-completed {
      background: #E3F2FD;
      color: #2196F3;
    }

    .status-cancelled {
      background: #FFEBEE;
      color: #f44336;
    }

    .btn-access {
      width: 100%;
      padding: 0.75rem;
      background: #0891b2;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }

    .btn-access:hover {
      background: #0e7490;
    }
    
    /* Rating Widget */
    .rating-widget {
      margin: 1rem 0;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    
    .rating-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .rating-display .stars {
      color: #ffc107;
      font-size: 1.1rem;
      letter-spacing: 2px;
    }
    
    .rating-text {
      color: #666;
      font-size: 0.875rem;
    }
    
    .btn-review {
      width: 100%;
      padding: 0.5rem;
      background: white;
      color: #0891b2;
      border: 1px solid #0891b2;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    
    .btn-review:hover {
      background: #0891b2;
      color: white;
    }
    
    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #999;
      line-height: 1;
      padding: 0;
      width: 32px;
      height: 32px;
    }
    
    .close-btn:hover {
      color: #333;
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .rating-input {
      margin-bottom: 1.5rem;
    }
    
    .rating-input label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }
    
    .stars-input {
      display: flex;
      gap: 0.5rem;
      font-size: 2.5rem;
    }
    
    .star-input {
      cursor: pointer;
      color: #ddd;
      transition: color 0.2s;
    }
    
    .star-input:hover,
    .star-input.filled {
      color: #ffc107;
    }
    
    .comment-input {
      margin-bottom: 1rem;
    }
    
    .comment-input label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }
    
    .comment-input textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.95rem;
      resize: vertical;
    }
    
    .char-count {
      display: block;
      text-align: right;
      font-size: 0.75rem;
      color: #999;
      margin-top: 0.25rem;
    }
    
    .modal-footer {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #eee;
    }
    
    .btn-cancel {
      flex: 1;
      padding: 0.75rem;
      background: white;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .btn-cancel:hover {
      background: #f5f5f5;
    }
    
    .btn-submit {
      flex: 1;
      padding: 0.75rem;
      background: #0891b2;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .btn-submit:hover:not(:disabled) {
      background: #0e7490;
    }
    
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .btn-browse {
      padding: 1rem 2rem;
      background: #0891b2;
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

    .btn-browse:hover {
      background: #0e7490;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
    }

    @media (max-width: 768px) {
      .my-courses-container {
        padding: 1rem;
      }

      .courses-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Two-column layout */
    .my-courses-page-layout {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
      padding: 1rem;
    }
    .my-courses-main { flex: 1; min-width: 0; }

    @media (max-width: 1024px) {
      .my-courses-page-layout { flex-direction: column; }
    }
  `]
})
export class MyCoursesComponent implements OnInit {
  enrolledCourses: EnrolledCourse[] = [];
  loading = true;
  currentUserId?: number;
  
  // Review modal
  showReviewModal = false;
  selectedCourseId?: number;
  reviewRating = 0;
  reviewComment = '';
  hoverRating = 0;
  submittingReview = false;

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.idUser;
        this.loadEnrolledCourses();
      } else {
        this.loading = false;
      }
    });
  }

  loadEnrolledCourses(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.formationService.getUserEnrollments(this.currentUserId).subscribe({
      next: (enrollments) => {
        console.log('📚 Enrollments loaded:', enrollments);
        
        // Pour chaque enrollment, charger le cours correspondant
        const courseRequests = enrollments.map(enrollment =>
          this.formationService.getCourseById(enrollment.courseId)
        );

        // Attendre que tous les cours soient chargés
        Promise.all(courseRequests.map(req => req.toPromise()))
          .then(courses => {
            this.enrolledCourses = enrollments.map((enrollment, index) => ({
              enrollment,
              course: courses[index]!
            })).filter(item => item.course.status === 'PUBLISHED');

            // Charger les stats d'avis pour chaque cours
            this.loadReviewStats();
            
            console.log('✅ Enrolled courses:', this.enrolledCourses);
            this.loading = false;
          })
          .catch(err => {
            console.error('Error loading courses:', err);
            this.toastService.error('Erreur lors du chargement des formations');
            this.loading = false;
          });
      },
      error: (err) => {
        console.error('Error loading enrollments:', err);
        this.toastService.error('Erreur lors du chargement des inscriptions');
        this.loading = false;
      }
    });
  }

  continueLearning(courseId: number): void {
    console.log('🎯 Continue learning course:', courseId);
    console.log('📍 Navigating to: /learning/courses/' + courseId);
    this.router.navigate(['/learning/courses', courseId]);
  }

  accessCourse(courseId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('🎯 Accessing course:', courseId);
    console.log('👤 Current user ID:', this.currentUserId);
    console.log('🔑 User role:', this.authService.getUserRole());
    console.log('🎫 Token exists:', !!this.authService.getToken());
    console.log('📍 Navigating to: /learning/courses/' + courseId);
    
    // Navigate to course-player (not learning-player)
    this.router.navigate(['/learning/courses', courseId]).then(
      success => console.log('✅ Navigation success:', success),
      error => console.error('❌ Navigation error:', error)
    );
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'En cours',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  goBack(): void {
    this.location.back();
  }
  
  loadReviewStats(): void {
    this.enrolledCourses.forEach(item => {
      // Charger les stats
      this.formationService.getCourseRatingStats(item.course.id).subscribe({
        next: (stats) => {
          item.ratingStats = stats;
        },
        error: (err) => console.error('Error loading stats:', err)
      });
      
      // Charger mon avis
      if (this.currentUserId) {
        this.formationService.getMyReview(item.course.id, this.currentUserId).subscribe({
          next: (review) => {
            item.myReview = review;
          },
          error: (err) => console.error('Error loading my review:', err)
        });
      }
    });
  }
  
  openReviewModal(courseId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    const item = this.enrolledCourses.find(c => c.course.id === courseId);
    if (item?.myReview) {
      // Modifier l'avis existant
      this.reviewRating = item.myReview.rating;
      this.reviewComment = item.myReview.comment || '';
    } else {
      // Nouvel avis
      this.reviewRating = 0;
      this.reviewComment = '';
    }
    
    this.selectedCourseId = courseId;
    this.showReviewModal = true;
  }
  
  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedCourseId = undefined;
    this.reviewRating = 0;
    this.reviewComment = '';
    this.hoverRating = 0;
  }
  
  setRating(rating: number): void {
    this.reviewRating = rating;
  }
  
  submitReview(): void {
    if (!this.currentUserId || !this.selectedCourseId || this.reviewRating === 0) return;
    
    this.submittingReview = true;
    const request: ReviewRequest = {
      userId: this.currentUserId,
      rating: this.reviewRating,
      comment: this.reviewComment.trim()
    };
    
    this.formationService.addOrUpdateReview(this.selectedCourseId, request).subscribe({
      next: () => {
        this.toastService.success('Merci pour votre avis!');
        this.closeReviewModal();
        this.loadReviewStats();
        this.submittingReview = false;
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        
        // Vérifier si c'est une erreur de contenu inapproprié
        if (err.error?.code === 'INAPPROPRIATE_CONTENT' || 
            err.error?.message?.includes('inapproprié') ||
            err.error?.message?.includes('inappropriate')) {
          this.toastService.error('⚠️ Votre commentaire contient des mots inappropriés. Veuillez utiliser un langage respectueux.');
        } else {
          this.toastService.error('Erreur lors de l\'envoi de l\'avis');
        }
        
        this.submittingReview = false;
      }
    });
  }
  
  getStarsArray(rating: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(rating));
  }
}
