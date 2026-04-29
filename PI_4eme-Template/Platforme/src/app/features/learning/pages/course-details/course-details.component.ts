import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormationService, AuthService } from '@core/services';
import { Course } from '@shared/models/formation.model';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {
  course: Course | null = null;
  courseId!: number;
  currentUserId: number | null = null;
  canReview = false;
  isReviewModalOpen = false;
  isEnrolled = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.idUser;
        this.loadCourseDetails();
        this.checkEnrollment();
        this.checkCanReview();
      }
    });
  }
  
  loadCourseDetails(): void {
    this.formationService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
      },
      error: (err) => console.error('Error loading course:', err)
    });
  }
  
  checkEnrollment(): void {
    if (!this.currentUserId) return;
    
    this.formationService.checkCourseEnrollment(this.currentUserId, this.courseId).subscribe({
      next: (result) => {
        this.isEnrolled = result.isEnrolled;
      },
      error: (err) => console.error('Error checking enrollment:', err)
    });
  }
  
  checkCanReview(): void {
    if (!this.currentUserId) return;
    
    this.formationService.canUserReview(this.courseId, this.currentUserId).subscribe({
      next: (result) => {
        this.canReview = result.canReview;
      },
      error: (err) => console.error('Error checking review permission:', err)
    });
  }
  
  openReviewModal(): void {
    this.isReviewModalOpen = true;
  }
  
  closeReviewModal(): void {
    this.isReviewModalOpen = false;
  }
  
  onReviewSubmitted(): void {
    // Reload reviews after submission
    window.location.reload();
  }
  
  enrollInCourse(): void {
    if (!this.currentUserId) return;
    
    this.formationService.enrollInCourse(this.courseId, this.currentUserId).subscribe({
      next: () => {
        this.isEnrolled = true;
        alert('Inscription réussie!');
      },
      error: (err) => console.error('Error enrolling:', err)
    });
  }
  
  startCourse(): void {
    this.router.navigate(['/learning/player', this.courseId]);
  }
  
  goBack(): void {
    this.router.navigate(['/learning/browse']);
  }
}
