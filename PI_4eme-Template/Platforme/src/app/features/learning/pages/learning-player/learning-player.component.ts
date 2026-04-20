import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '@core/services/formation.service';
import { ContentManagementService, LessonResponse } from '@core/services/content-management.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { Course } from '@shared/models';

@Component({
  selector: 'app-learning-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning-player.component.html',
  styleUrls: ['./learning-player.component.css']
})
export class LearningPlayerComponent implements OnInit {
  courseId!: number;
  course: Course | null = null;
  lessons: LessonResponse[] = [];
  currentLessonIndex = 0;
  isPlaying = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formationService: FormationService,
    private contentService: ContentManagementService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const courseIdParam = this.route.snapshot.paramMap.get('courseId');
    if (courseIdParam) {
      this.courseId = +courseIdParam;
      console.log('🎯 Learning Player initialized with courseId:', this.courseId);
      this.loadCourse();
      this.loadLessons();
    } else {
      console.error('❌ No courseId in route params');
      this.toastService.error('ID de formation invalide');
      this.router.navigate(['/learning/my-courses']);
    }
  }

  loadCourse(): void {
    this.formationService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        console.log('✅ Course loaded:', course);
        this.course = course;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading course:', error);
        this.toastService.error('Erreur lors du chargement de la formation');
        this.loading = false;
      }
    });
  }

  loadLessons(): void {
    this.contentService.getLessons(this.courseId).subscribe({
      next: (lessons) => {
        console.log('📚 Lessons loaded:', lessons);
        this.lessons = lessons.sort((a, b) => a.orderIndex - b.orderIndex);
        if (this.lessons.length === 0) {
          this.toastService.info('Aucun chapitre disponible pour cette formation');
        }
      },
      error: (error) => {
        console.error('❌ Error loading lessons:', error);
        this.toastService.error('Erreur lors du chargement des chapitres');
        this.lessons = [];
      }
    });
  }

  get currentLesson() {
    return this.lessons[this.currentLessonIndex] || {
      id: 0,
      title: 'Aucun chapitre',
      description: '',
      orderIndex: 0,
      durationMinutes: 0,
      resources: []
    };
  }

  nextLesson(): void {
    if (this.currentLessonIndex < this.lessons.length - 1) {
      this.currentLessonIndex++;
    }
  }

  previousLesson(): void {
    if (this.currentLessonIndex > 0) {
      this.currentLessonIndex--;
    }
  }

  selectLesson(index: number): void {
    this.currentLessonIndex = index;
  }

  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
  }

  completeLesson(): void {
    console.log('Lesson marked as complete');
    this.toastService.success('Chapitre marqué comme terminé');
    this.nextLesson();
  }

  goBack(): void {
    this.location.back();
  }
}
