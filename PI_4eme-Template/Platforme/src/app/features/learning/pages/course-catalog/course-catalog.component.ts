import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormationService, CourseRatingStats, CourseReview } from '@core/services/formation.service';
import { SubscriptionService } from '@core/services/subscription.service';
import { Course, CourseStatus, CourseLevel } from '@shared/models/formation.model';
import { UserSubscription } from '@shared/models';
import { FormsModule } from '@angular/forms';

interface CourseWithRating extends Course {
  ratingStats?: CourseRatingStats;
}

@Component({
  selector: 'app-course-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-catalog.component.html',
  styleUrls: ['./course-catalog.component.css']
})
export class CourseCatalogComponent implements OnInit {
  courses: CourseWithRating[] = [];
  filteredCourses: CourseWithRating[] = [];
  loading = false;
  subscription: UserSubscription | null = null;
  
  selectedLevel: CourseLevel | 'All' = 'All';
  searchQuery = '';

  levels = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  
  // Reviews modal
  showReviewsModal = false;
  selectedCourseReviews: CourseReview[] = [];
  selectedCourseTitle = '';
  loadingReviews = false;

  constructor(
    private formationService: FormationService,
    private subscriptionService: SubscriptionService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadSubscription();
  }

  loadSubscription(): void {
    this.subscriptionService.getMySubscription().subscribe({
      next: (subscription) => {
        this.subscription = subscription;
        console.log('✅ Subscription loaded:', subscription);
      },
      error: (err) => {
        console.warn('⚠️ No subscription found (this is OK):', err);
        this.subscription = null;
      }
    });
  }

  loadCourses(): void {
    this.loading = true;
    this.formationService.getCourses(CourseStatus.PUBLISHED).subscribe({
      next: (courses) => {
        console.log('📚 Courses loaded:', courses);
        // Filter out courses without accessLevel (safety check)
        this.courses = courses.filter(course => {
          if (!course.accessLevel) {
            console.warn('⚠️ Course missing accessLevel:', course);
            return false;
          }
          return true;
        });
        
        // Load rating stats for each course
        this.loadRatingStats();
        
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading courses:', err);
        this.loading = false;
      }
    });
  }
  
  loadRatingStats(): void {
    this.courses.forEach(course => {
      this.formationService.getCourseRatingStats(course.id).subscribe({
        next: (stats) => {
          course.ratingStats = stats;
        },
        error: (err) => console.error('Error loading stats for course', course.id, err)
      });
    });
  }
  
  getStarsArray(rating: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(rating));
  }

  applyFilters(): void {
    this.filteredCourses = this.courses.filter(course => {
      const matchLevel = this.selectedLevel === 'All' || course.level === this.selectedLevel;
      const matchSearch = !this.searchQuery || 
        course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return matchLevel && matchSearch;
    });
  }

  onLevelChange(level: string): void {
    this.selectedLevel = level === 'All' ? 'All' : level as CourseLevel;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  goBack(): void {
    this.location.back();
  }

  canAccessCourse(course: Course): boolean {
    if (!this.subscription || this.subscription.status !== 'ACTIVE') {
      return false;
    }

    const userLevel = this.subscription.plan.accessLevel;
    const courseLevel = this.getCourseAccessLevel(course.level);

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

  getAccessLevelBadge(course: Course): string {
    // Use the accessLevel from the course directly
    return course.accessLevel || this.getCourseAccessLevel(course.level);
  }

  goToPricing(): void {
    this.router.navigate(['/pricing']);
  }

  navigateToCourse(courseId: number): void {
    console.log('🎯 CLICKING ON COURSE:', courseId);
    console.log('🔑 Current token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    console.log('👤 Current role:', localStorage.getItem('role'));
    console.log('📍 Navigating to:', `/learning/course/${courseId}`);
    
    this.router.navigate(['/learning/course', courseId]).then(
      success => {
        console.log('✅ Navigation result:', success);
      },
      error => {
        console.error('❌ Navigation error:', error);
      }
    );
  }

  onImageError(event: any): void {
    // Hide broken image and show gradient placeholder
    const img = event.target;
    if (img && img.parentElement) {
      img.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'course-thumbnail-placeholder';
      placeholder.innerHTML = '<span>📚</span>';
      img.parentElement.appendChild(placeholder);
    }
  }
  
  openReviewsModal(course: Course, event: Event): void {
    event.stopPropagation();
    this.selectedCourseTitle = course.title;
    this.showReviewsModal = true;
    this.loadingReviews = true;
    
    this.formationService.getAllReviews(course.id).subscribe({
      next: (reviews) => {
        this.selectedCourseReviews = reviews;
        this.loadingReviews = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loadingReviews = false;
      }
    });
  }
  
  closeReviewsModal(): void {
    this.showReviewsModal = false;
    this.selectedCourseReviews = [];
    this.selectedCourseTitle = '';
  }
  
  getReviewStarsArray(rating: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= rating);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
