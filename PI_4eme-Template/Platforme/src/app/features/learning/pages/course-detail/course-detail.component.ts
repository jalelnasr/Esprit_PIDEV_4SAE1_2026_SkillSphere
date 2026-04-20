import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '@core/services/formation.service';
import { ContentManagementService, LessonResponse } from '@core/services/content-management.service';
import { SubscriptionService } from '@core/services/subscription.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { Course, Session, CourseLevel } from '@shared/models/formation.model';
import { UserSubscription } from '@shared/models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  courseId!: number;
  course?: Course;
  sessions: Session[] = [];
  lessons: LessonResponse[] = [];
  loading = false;
  activeTab: 'overview' | 'sessions' | 'curriculum' = 'overview';
  subscription: UserSubscription | null = null;
  
  currentUserId?: number;
  enrolledSessionIds: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private formationService: FormationService,
    private contentService: ContentManagementService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    console.log('🔍 CourseDetailComponent initialized');
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId = +id;
      console.log('📚 Loading course with ID:', this.courseId);
      this.loadCourseData();
      this.loadSubscription();
    } else {
      console.error('❌ No course ID found in route');
      this.router.navigate(['/learning/browse']);
    }
    
    // Get current user ID from auth
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('👤 Current user:', user);
        this.currentUserId = user.idUser;
        this.loadEnrolledSessions();
      } else {
        console.warn('⚠️ No user found in auth service');
      }
    });
  }

  loadEnrolledSessions(): void {
    if (!this.currentUserId) return;
    
    this.formationService.getUserEnrolledSessionIds(this.currentUserId).subscribe({
      next: (sessionIds) => {
        this.enrolledSessionIds = new Set(sessionIds);
      },
      error: (err) => console.error('Error loading enrolled sessions:', err)
    });
  }

  isEnrolledInSession(sessionId: number): boolean {
    return this.enrolledSessionIds.has(sessionId);
  }

  loadSubscription(): void {
    this.subscriptionService.getMySubscription().subscribe({
      next: (subscription) => {
        this.subscription = subscription;
      },
      error: (err) => {
        console.error('Error loading subscription:', err);
      }
    });
  }

  loadCourseData(): void {
    this.loading = true;
    
    // Charger d'abord le cours
    this.formationService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
        
        // Charger les sessions (optionnel)
        this.formationService.getCourseSessions(this.courseId).subscribe({
          next: (sessions) => {
            this.sessions = sessions;
          },
          error: (err) => {
            console.warn('Sessions not available:', err);
            this.sessions = [];
          }
        });
        
        // Charger les lessons (optionnel)
        this.contentService.getLessons(this.courseId).subscribe({
          next: (lessons) => {
            this.lessons = lessons;
          },
          error: (err) => {
            console.warn('Lessons not available:', err);
            this.lessons = [];
          }
        });
      },
      error: (err) => {
        console.error('Error loading course:', err);
        this.loading = false;
        
        // Check if it's an authentication error
        if (err.status === 401 || err.status === 403) {
          this.toastService.error('Vous devez être connecté pour accéder à cette formation');
          this.router.navigate(['/auth/login'], { 
            queryParams: { returnUrl: `/learning/course/${this.courseId}` } 
          });
        } else {
          this.toastService.error('Erreur lors du chargement de la formation');
          // Navigate to catalog instead of goBack() to avoid navigation issues
          this.router.navigate(['/learning/browse']);
        }
      }
    });
  }

  enrollInSession(sessionId: number): void {
    if (!this.currentUserId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.formationService.enrollInSession(sessionId, this.currentUserId).subscribe({
      next: () => {
        this.toastService.success('Inscription réussie !');
        this.enrolledSessionIds.add(sessionId);
        this.loadCourseData();
      },
      error: (err) => {
        console.error('Error enrolling:', err);
        this.handleEnrollmentError(err);
      }
    });
  }

  handleEnrollmentError(error: any): void {
    if (error.status === 403 && error.error?.code) {
      switch (error.error.code) {
        case 'PLAN_REQUIRED':
          this.toastService.error('Vous devez avoir un abonnement actif');
          setTimeout(() => this.router.navigate(['/pricing']), 2000);
          break;
        case 'UPGRADE_REQUIRED':
          this.toastService.error(`Mettez à niveau vers ${error.error.requiredPlan} pour accéder`);
          setTimeout(() => this.router.navigate(['/pricing']), 2000);
          break;
        case 'MONTHLY_LIMIT_REACHED':
          this.toastService.error('Limite mensuelle atteinte. Mettez à niveau votre plan');
          setTimeout(() => this.router.navigate(['/pricing']), 2000);
          break;
        default:
          this.toastService.error('Erreur lors de l\'inscription');
      }
    } else {
      this.toastService.error('Erreur lors de l\'inscription');
    }
  }

  canAccessCourse(): boolean {
    if (!this.course || !this.subscription || this.subscription.status !== 'ACTIVE') {
      return false;
    }

    const userLevel = this.subscription.plan.accessLevel;
    const courseLevel = this.getCourseAccessLevel(this.course.level);

    if (userLevel === 'PREMIUM') return true;
    if (userLevel === 'PLUS') return courseLevel !== 'PREMIUM';
    if (userLevel === 'BASIC') return courseLevel === 'BASIC';
    return false;
  }

  getCourseAccessLevel(difficulty: CourseLevel): 'BASIC' | 'PLUS' | 'PREMIUM' {
    switch (difficulty) {
      case 'BEGINNER': return 'BASIC';
      case 'INTERMEDIATE': return 'PLUS';
      case 'ADVANCED': return 'PREMIUM';
      default: return 'BASIC';
    }
  }

  getAccessMessage(): string {
    if (!this.subscription) {
      return 'Abonnez-vous pour accéder à ce cours';
    }
    if (this.subscription.status !== 'ACTIVE') {
      return 'Votre abonnement n\'est pas actif';
    }
    if (!this.canAccessCourse()) {
      return 'Mettez à niveau votre abonnement pour accéder';
    }
    return '';
  }

  goToPricing(): void {
    this.router.navigate(['/pricing']);
  }

  goBack(): void {
    this.location.back();
  }

  onImageError(event: any): void {
    // Hide broken image and show gradient placeholder
    const img = event.target;
    if (img && img.parentElement) {
      img.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'course-banner-placeholder';
      placeholder.innerHTML = '<span>📚 Formation</span>';
      img.parentElement.appendChild(placeholder);
    }
  }
}
