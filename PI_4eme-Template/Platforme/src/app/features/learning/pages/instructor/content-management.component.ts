import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContentManagementService, LessonResponse, LessonResourceResponse } from '@core/services/content-management.service';
import { FormationService } from '@core/services/formation.service';
import { QuizService, QuizData } from '@core/services/quiz.service';
import { Course } from '@shared/models';
import { QuizBuilderComponent } from '@shared/components/quiz-builder/quiz-builder.component';

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [CommonModule, FormsModule, QuizBuilderComponent],
  template: `
    <div class="content-management">
      <div class="header">
        <h1>{{ formation?.title }}</h1>
        <button class="btn-add" (click)="showAddLessonModal()">
          <i class="fas fa-plus"></i> Add Chapter
        </button>
      </div>

      <div class="lessons-list" *ngIf="lessons.length > 0">
        <div class="lesson-card" *ngFor="let lesson of lessons; let i = index">
          <div class="lesson-header" (click)="toggleLesson(lesson.id)">
            <div class="lesson-title">
              <i class="fas fa-book"></i>
              <span>{{ lesson.title }}</span>
              <span class="lesson-index">Chapter {{ i + 1 }}</span>
            </div>
            <div class="lesson-actions">
              <button class="btn-icon" (click)="editLesson(lesson); $event.stopPropagation()">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" (click)="deleteLesson(lesson); $event.stopPropagation()">
                <i class="fas fa-trash"></i>
              </button>
              <i class="fas" [class.fa-chevron-down]="!expandedLessons[lesson.id]" 
                 [class.fa-chevron-up]="expandedLessons[lesson.id]"></i>
            </div>
          </div>

          <div class="lesson-content" *ngIf="expandedLessons[lesson.id]">
            <p class="lesson-description" *ngIf="lesson.description">{{ lesson.description }}</p>
            
            <div class="resources-section">
              <div class="resources-header">
                <h3>Resources</h3>
                <div class="add-resource-buttons">
                  <button class="btn-small" (click)="showAddVideoModal(lesson)">
                    <i class="fas fa-video"></i> Add Video
                  </button>
                  <button class="btn-small" (click)="showAddPdfModal(lesson)">
                    <i class="fas fa-file-pdf"></i> Add PDF
                  </button>
                  <button class="btn-small btn-quiz" (click)="openQuizBuilder(lesson); $event.stopPropagation()">
                    <i class="fas fa-question-circle"></i>
                    {{ lessonQuizzes[lesson.id] ? 'Edit Quiz' : 'Add Quiz' }}
                  </button>
                  <button class="btn-small btn-analytics"
                          *ngIf="lessonQuizzes[lesson.id]"
                          (click)="toggleQuizAnalytics(lesson.id); $event.stopPropagation()">
                    <i class="fas fa-chart-bar"></i> Analytics
                  </button>
                </div>
              </div>

              <div class="resources-list" *ngIf="lesson.resources && lesson.resources.length > 0">
                <div class="resource-item" *ngFor="let resource of lesson.resources">
                  <i class="fas" [class.fa-video]="resource.type === 'VIDEO'" 
                     [class.fa-file-pdf]="resource.type === 'PDF'"></i>
                  <span class="resource-title">{{ resource.title }}</span>
                  <span class="resource-meta" *ngIf="resource.durationMinutes">
                    {{ resource.durationMinutes }} min
                  </span>
                  <span class="resource-meta" *ngIf="resource.fileSizeBytes">
                    {{ formatFileSize(resource.fileSizeBytes) }}
                  </span>
                  <div class="resource-actions">
                    <button class="btn-icon-small btn-edit" (click)="editResource(resource)" title="Edit">
                      <i class="fas fa-edit"></i>
                      <span>Edit</span>
                    </button>
                    <button class="btn-icon-small btn-delete" (click)="deleteResource(resource)" title="Delete">
                      <i class="fas fa-trash"></i>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="empty-resources" *ngIf="!lesson.resources || lesson.resources.length === 0">
                <p>No resources yet. Add videos or PDFs to this chapter.</p>
              </div>
            </div>

            <!-- Quiz Analytics Panel (on-demand) -->
            <div class="analytics-panel" *ngIf="expandedAnalytics[lesson.id] && lessonAnalytics[lesson.id]">
              <div class="analytics-header">
                <span>📊 Quiz Analytics — {{ lessonQuizzes[lesson.id].title }}</span>
              </div>
              <div class="analytics-stats">
                <div class="a-stat">
                  <span class="a-val">{{ lessonAnalytics[lesson.id].totalAttempts }}</span>
                  <span class="a-lbl">Attempts</span>
                </div>
                <div class="a-stat">
                  <span class="a-val">{{ lessonAnalytics[lesson.id].averageScore }}%</span>
                  <span class="a-lbl">Avg Score</span>
                </div>
                <div class="a-stat">
                  <span class="a-val">{{ lessonAnalytics[lesson.id].passRate }}%</span>
                  <span class="a-lbl">Pass Rate</span>
                </div>
                <div class="a-stat">
                  <span class="a-val">{{ lessonAnalytics[lesson.id].passedCount }}</span>
                  <span class="a-lbl">Passed</span>
                </div>
              </div>
              <div class="weak-questions" *ngIf="lessonAnalytics[lesson.id].weakestQuestions.length > 0">
                <p class="weak-title">⚠️ Weakest Questions</p>
                <div class="weak-item" *ngFor="let wq of lessonAnalytics[lesson.id].weakestQuestions">
                  <div class="weak-bar-wrap">
                    <span class="weak-text">{{ wq.questionText | slice:0:60 }}{{ wq.questionText.length > 60 ? '...' : '' }}</span>
                    <span class="weak-pct">{{ wq.wrongPercent }}% wrong</span>
                  </div>
                  <div class="weak-bar">
                    <div class="weak-fill" [style.width.%]="wq.wrongPercent"></div>
                  </div>
                </div>
              </div>
              <p class="no-attempts" *ngIf="lessonAnalytics[lesson.id].totalAttempts === 0">
                No attempts yet.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="lessons.length === 0 && !loading">
        <i class="fas fa-book-open"></i>
        <h2>No chapters yet</h2>
        <p>Start building your course by adding chapters</p>
      </div>

      <div class="loading" *ngIf="loading">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    </div>

    <!-- Add/Edit Lesson Modal -->
    <div class="modal" *ngIf="showLessonModal" (click)="closeLessonModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>{{ editingLesson ? 'Edit Chapter' : 'Add Chapter' }}</h2>
        <form (ngSubmit)="saveLesson()">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" [(ngModel)]="lessonForm.title" name="title" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="lessonForm.description" name="description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Order Index *</label>
            <input type="number" [(ngModel)]="lessonForm.orderIndex" name="orderIndex" required>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeLessonModal()">Cancel</button>
            <button type="submit" class="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add/Edit Resource Modal -->
    <div class="modal" *ngIf="showResourceModal" (click)="closeResourceModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">        <h2>{{ editingResource ? 'Edit Resource' : 'Add ' + resourceType }}</h2>
        <form (ngSubmit)="saveResource()">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" [(ngModel)]="resourceForm.title" name="title" required>
          </div>
          
          <div class="form-group">
            <label>Upload File {{ editingResource ? '(optional - leave empty to keep current)' : '' }}</label>
            <input type="file" 
                   [accept]="resourceType === 'Video' ? 'video/*' : 'application/pdf'"
                   (change)="onFileSelected($event)"
                   name="file">
            <small *ngIf="resourceForm.file">Selected: {{ resourceForm.file.name }}</small>
            <small *ngIf="editingResource && !resourceForm.file" class="text-info">
              Current file will be kept if you don't upload a new one
            </small>
          </div>

          <div class="form-group">
            <label>Or Enter URL {{ editingResource && !resourceForm.file ? '*' : '(if not uploading file)' }}</label>
            <input type="text" 
                   [(ngModel)]="resourceForm.url" 
                   name="url" 
                   [required]="(!!editingResource && !resourceForm.file) || (!editingResource && !resourceForm.file)"
                   placeholder="https://...">
          </div>

          <div class="form-group" *ngIf="resourceType === 'Video'">
            <label>Duration (minutes)</label>
            <input type="number" [(ngModel)]="resourceForm.durationMinutes" name="durationMinutes">
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeResourceModal()" [disabled]="uploadingFile">
              Cancel
            </button>
            <button type="submit" class="btn-save" [disabled]="uploadingFile">
              <i class="fas fa-spinner fa-spin" *ngIf="uploadingFile"></i>
              {{ uploadingFile ? 'Uploading...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Quiz Builder Modal -->
    <div class="modal" *ngIf="showQuizModal" (click)="closeQuizModal()">
      <div class="modal-content modal-wide" (click)="$event.stopPropagation()">
        <app-quiz-builder
          [lessonId]="quizLessonId!"
          [existingQuiz]="currentLessonQuiz"
          (saved)="onQuizSaved()"
          (cancel)="closeQuizModal()">
        </app-quiz-builder>
      </div>
    </div>
  `,
  styleUrls: ['./content-management.component.css']
})
export class ContentManagementComponent implements OnInit {
  formationId!: number;
  formation: Course | null = null;
  lessons: LessonResponse[] = [];
  expandedLessons: { [key: number]: boolean } = {};
  loading = true;

  // Modal states
  showLessonModal = false;
  showResourceModal = false;
  editingLesson: LessonResponse | null = null;
  editingResource: LessonResourceResponse | null = null;
  currentLesson: LessonResponse | null = null;
  resourceType: 'Video' | 'PDF' = 'Video';

  // Form data
  lessonForm = {
    title: '',
    description: '',
    orderIndex: 0
  };

  resourceForm = {
    title: '',
    url: '',
    durationMinutes: undefined as number | undefined,
    file: null as File | null
  };

  uploadingFile = false;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentManagementService,
    private formationService: FormationService,
    private quizService: QuizService
  ) {}

  // ── Quiz builder state ─────────────────────────────────────────────────────
  showQuizModal = false;
  quizLessonId?: number;
  currentLessonQuiz: QuizData | null = null;
  lessonQuizzes: { [lessonId: number]: QuizData } = {};
  expandedAnalytics: { [lessonId: number]: boolean } = {};
  lessonAnalytics: { [lessonId: number]: any } = {};

  toggleQuizAnalytics(lessonId: number): void {
    this.expandedAnalytics[lessonId] = !this.expandedAnalytics[lessonId];
    // Load on first open
    if (this.expandedAnalytics[lessonId] && !this.lessonAnalytics[lessonId]) {
      const quiz = this.lessonQuizzes[lessonId];
      if (quiz) {
        this.quizService.getAnalytics(quiz.id).subscribe({
          next: analytics => this.lessonAnalytics[lessonId] = analytics,
          error: () => {}
        });
      }
    }
  }

  openQuizBuilder(lesson: LessonResponse): void {
    this.quizLessonId = lesson.id;
    this.currentLessonQuiz = this.lessonQuizzes[lesson.id] ?? null;
    this.showQuizModal = true;
  }

  closeQuizModal(): void {
    this.showQuizModal = false;
    this.quizLessonId = undefined;
    this.currentLessonQuiz = null;
  }

  onQuizSaved(): void {
    this.closeQuizModal();
    this.loadQuizStatus();
  }

  loadQuizStatus(): void {
    this.lessons.forEach(lesson => {
      this.quizService.hasQuiz(lesson.id).subscribe({
        next: ({ hasQuiz }) => {
          if (hasQuiz) {
            this.quizService.getQuiz(lesson.id).subscribe({
              next: quiz => this.lessonQuizzes[lesson.id] = quiz,
              error: () => {}
            });
          } else {
            delete this.lessonQuizzes[lesson.id];
          }
        },
        error: () => {}
      });
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.formationId = +params['id'];
      this.loadFormation();
      this.loadLessons();
    });
  }

  loadFormation(): void {
    this.formationService.getCourseById(this.formationId).subscribe({
      next: (formation) => {
        this.formation = formation;
      },
      error: (error) => console.error('Error loading formation:', error)
    });
  }

  loadLessons(): void {
    this.loading = true;
    this.contentService.getLessons(this.formationId).subscribe({
      next: (lessons) => {
        this.lessons = lessons.sort((a, b) => a.orderIndex - b.orderIndex);
        this.loading = false;
        this.loadQuizStatus();
      },
      error: (error) => {
        console.error('Error loading lessons:', error);
        this.loading = false;
      }
    });
  }

  toggleLesson(lessonId: number): void {
    this.expandedLessons[lessonId] = !this.expandedLessons[lessonId];
  }

  showAddLessonModal(): void {
    this.editingLesson = null;
    this.lessonForm = {
      title: '',
      description: '',
      orderIndex: this.lessons.length
    };
    this.showLessonModal = true;
  }

  editLesson(lesson: LessonResponse): void {
    this.editingLesson = lesson;
    this.lessonForm = {
      title: lesson.title,
      description: lesson.description || '',
      orderIndex: lesson.orderIndex
    };
    this.showLessonModal = true;
  }

  closeLessonModal(): void {
    this.showLessonModal = false;
    this.editingLesson = null;
  }

  saveLesson(): void {
    const request = {
      title: this.lessonForm.title,
      description: this.lessonForm.description,
      orderIndex: this.lessonForm.orderIndex,
      durationMinutes: undefined
    };

    if (this.editingLesson) {
      this.contentService.updateLesson(this.editingLesson.id, request).subscribe({
        next: () => {
          this.loadLessons();
          this.closeLessonModal();
        },
        error: (error) => console.error('Error updating lesson:', error)
      });
    } else {
      this.contentService.createLesson(this.formationId, request).subscribe({
        next: () => {
          this.loadLessons();
          this.closeLessonModal();
        },
        error: (error) => console.error('Error creating lesson:', error)
      });
    }
  }

  deleteLesson(lesson: LessonResponse): void {
    if (confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
      this.contentService.deleteLesson(lesson.id).subscribe({
        next: () => this.loadLessons(),
        error: (error) => console.error('Error deleting lesson:', error)
      });
    }
  }

  showAddVideoModal(lesson: LessonResponse): void {
    this.currentLesson = lesson;
    this.resourceType = 'Video';
    this.editingResource = null;
    this.resourceForm = {
      title: '',
      url: '',
      durationMinutes: undefined,
      file: null
    };
    this.showResourceModal = true;
  }

  showAddPdfModal(lesson: LessonResponse): void {
    this.currentLesson = lesson;
    this.resourceType = 'PDF';
    this.editingResource = null;
    this.resourceForm = {
      title: '',
      url: '',
      durationMinutes: undefined,
      file: null
    };
    this.showResourceModal = true;
  }

  editResource(resource: LessonResourceResponse): void {
    this.editingResource = resource;
    this.resourceType = resource.type === 'VIDEO' ? 'Video' : 'PDF';
    this.resourceForm = {
      title: resource.title,
      url: resource.url,
      durationMinutes: resource.durationMinutes,
      file: null
    };
    this.showResourceModal = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.resourceForm.file = file;
      if (!this.resourceForm.title) {
        this.resourceForm.title = file.name.replace(/\.[^/.]+$/, '');
      }
    }
  }

  closeResourceModal(): void {
    this.showResourceModal = false;
    this.editingResource = null;
    this.currentLesson = null;
  }

  saveResource(): void {
    if (!this.currentLesson && !this.editingResource) return;

    // If file is selected, upload it first (works for both add and edit)
    if (this.resourceForm.file) {
      this.uploadingFile = true;
      const uploadMethod = this.resourceType === 'Video'
        ? this.contentService.uploadVideo(this.resourceForm.file)
        : this.contentService.uploadPdf(this.resourceForm.file);

      uploadMethod.subscribe({
        next: (response) => {
          console.log('✅ File uploaded successfully:', response);
          this.resourceForm.url = response.url;
          this.uploadingFile = false;
          this.saveResourceWithUrl();
        },
        error: (error) => {
          console.error('❌ Error uploading file:', error);
          this.uploadingFile = false;
          
          let errorMessage = 'Failed to upload file. ';
          if (error.status === 0) {
            errorMessage += 'Cannot connect to server. Make sure Formation Service is running on port 8086.';
          } else if (error.status === 413) {
            errorMessage += 'File is too large. Maximum size is 50MB.';
          } else if (error.status === 400) {
            errorMessage += error.error?.error || 'Invalid file type or format.';
          } else if (error.status === 500) {
            errorMessage += 'Server error. Check Formation Service logs.';
          } else {
            errorMessage += error.error?.error || error.message || 'Unknown error occurred.';
          }
          
          alert(errorMessage);
        }
      });
    } else {
      this.saveResourceWithUrl();
    }
  }

  private saveResourceWithUrl(): void {
    const request = {
      title: this.resourceForm.title,
      type: this.resourceType === 'Video' ? 'VIDEO' as const : 'PDF' as const,
      url: this.resourceForm.url,
      durationMinutes: this.resourceForm.durationMinutes
    };

    if (this.editingResource) {
      this.contentService.updateResource(this.editingResource.id, request).subscribe({
        next: () => {
          this.loadLessons();
          this.closeResourceModal();
        },
        error: (error) => console.error('Error updating resource:', error)
      });
    } else if (this.currentLesson) {
      const addMethod = this.resourceType === 'Video' 
        ? this.contentService.addVideoResource(this.currentLesson.id, request)
        : this.contentService.addPdfResource(this.currentLesson.id, request);

      addMethod.subscribe({
        next: () => {
          this.loadLessons();
          this.closeResourceModal();
        },
        error: (error) => console.error('Error adding resource:', error)
      });
    }
  }

  deleteResource(resource: LessonResourceResponse): void {
    if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      this.contentService.deleteResource(resource.id).subscribe({
        next: () => this.loadLessons(),
        error: (error) => console.error('Error deleting resource:', error)
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
