import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormationService } from '@core/services/formation.service';
import { ContentManagementService, LessonResponse, LessonResourceResponse } from '@core/services/content-management.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { QuizService, QuizData } from '@core/services/quiz.service';
import { Course } from '@shared/models';
import { QuizPlayerComponent } from '@shared/components/quiz-player/quiz-player.component';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, QuizPlayerComponent],
  templateUrl: './course-player.component.html',
  styleUrls: ['./course-player.component.css']
})
export class CoursePlayerComponent implements OnInit {
  courseId!: number;
  course: Course | null = null;
  lessons: LessonResponse[] = [];
  selectedLesson: LessonResponse | null = null;
  selectedResource: LessonResourceResponse | null = null;
  loading = true;
  canAccessCourse = false;
  currentUserId?: number;
  enrollmentId?: number;
  currentLessonQuiz: QuizData | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private contentService: ContentManagementService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private toastService: ToastService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = +params['id'];
      console.log('🎯 Course Player initialized with courseId:', this.courseId);
      // Skip access check for now - just load the course
      this.loadCourseDirectly();
    });
  }

  loadCourseDirectly(): void {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        console.error('❌ No user found');
        this.toastService.error('Vous devez être connecté');
        this.router.navigate(['/auth/login']);
        return;
      }

      console.log('✅ User found:', user.email);
      this.currentUserId = user.idUser;
      
      // Get enrollment ID FIRST, then load course and lessons
      this.formationService.getUserEnrollments(user.idUser).subscribe({
        next: (enrollments) => {
          const enrollment = enrollments.find(e => e.courseId === this.courseId);
          if (enrollment) {
            this.enrollmentId = enrollment.id;
            console.log('✅ Enrollment ID found:', this.enrollmentId);
          } else {
            console.warn('⚠️ No enrollment found for this course');
          }
          
          // NOW load course and lessons after enrollment ID is set
          this.canAccessCourse = true;
          this.loadCourse();
          this.loadLessons();
        },
        error: (err) => {
          console.error('❌ Error fetching enrollments:', err);
          // Still allow access even if enrollment fetch fails
          this.canAccessCourse = true;
          this.loadCourse();
          this.loadLessons();
        }
      });
    });
  }

  checkAccess(): void {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        console.error('❌ No user found');
        this.toastService.error('Vous devez être connecté');
        this.router.navigate(['/auth/login']);
        return;
      }

      console.log('✅ User found:', user);
      this.currentUserId = user.idUser;

      // Vérifier si l'utilisateur est inscrit au cours
      this.formationService.checkCourseEnrollment(user.idUser, this.courseId).subscribe({
        next: (result) => {
          console.log('📋 Enrollment check result:', result);
          if (result.isEnrolled) {
            console.log('✅ User is enrolled, loading course');
            this.canAccessCourse = true;
            this.loadCourse();
            this.loadLessons();
          } else {
            console.warn('⚠️ User not enrolled in course');
            this.toastService.error('Vous devez être inscrit pour accéder à ce cours');
            this.router.navigate(['/learning/course', this.courseId]);
          }
        },
        error: (err) => {
          console.error('❌ Error checking access:', err);
          // If the enrollment check fails (e.g., 404), allow access anyway
          // This handles the case where user is enrolled via session
          console.log('⚠️ Enrollment check failed, allowing access anyway');
          this.canAccessCourse = true;
          this.loadCourse();
          this.loadLessons();
        }
      });
    });
  }

  loadCourse(): void {
    this.formationService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.loading = false;
      }
    });
  }

  loadLessons(): void {
    this.contentService.getLessons(this.courseId).subscribe({
      next: (lessons) => {
        console.log('📚 Lessons loaded:', lessons);
        this.lessons = lessons.sort((a, b) => a.orderIndex - b.orderIndex);
        if (this.lessons.length > 0) {
          this.selectLesson(this.lessons[0]);
        }
      },
      error: (error) => {
        console.error('Error loading lessons:', error);
        this.lessons = [];
      }
    });
  }

  selectLesson(lesson: LessonResponse): void {
    this.selectedLesson = lesson;
    this.selectedResource = null;
    this.currentLessonQuiz = null;

    // Load quiz for this lesson
    this.quizService.hasQuiz(lesson.id).subscribe({
      next: ({ hasQuiz }) => {
        if (hasQuiz) {
          this.quizService.getQuiz(lesson.id).subscribe({
            next: quiz => this.currentLessonQuiz = quiz,
            error: () => {}
          });
        }
      },
      error: () => {}
    });
    
    // Automatically mark lesson as completed when opened
    if (this.enrollmentId && lesson.id) {
      console.log(`📝 Marking lesson ${lesson.id} as completed for enrollment ${this.enrollmentId}`);
      this.formationService.markLessonCompleted(this.enrollmentId, lesson.id).subscribe({
        next: () => {
          console.log(`✅ Lesson ${lesson.id} marked as completed`);
          this.toastService.success('Leçon marquée comme complétée');
        },
        error: (err) => {
          console.error('❌ Error marking lesson as completed:', err);
          console.error('⚠️ Progress tracking unavailable - backend may need restart');
          // Don't show error toast to user - fail silently
          // The lesson will still be accessible, just progress won't be tracked
        }
      });
    } else {
      console.warn('⚠️ Cannot mark lesson as completed: missing enrollmentId or lessonId');
    }
  }

  playVideo(resource: LessonResourceResponse): void {
    this.selectedResource = resource;
  }

  stopVideo(): void {
    this.selectedResource = null;
  }

  viewPdf(resource: LessonResourceResponse): void {
    window.open(this.getResourceUrl(resource.url), '_blank');
  }

  getResourceUrl(url: string): string {
    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it starts with /uploads, it's a relative path from the Formation Service
    if (url.startsWith('/uploads')) {
      return `http://localhost:8080/formation-service${url}`;
    }
    
    // Otherwise, assume it's a relative path and prepend the base URL
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:8080/formation-service${cleanUrl}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onQuizCompleted(result: any): void {
    if (result.passed) {
      this.toastService.success(`Quiz passed! Score: ${result.score}%`);
    } else {
      this.toastService.error(`Score: ${result.score}% — Need ${result.passThreshold}% to pass. Try again!`);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
