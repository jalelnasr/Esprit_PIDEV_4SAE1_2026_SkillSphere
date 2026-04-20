import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormationService } from '@core/services/formation.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { Course, CourseRequest, CourseLevel, CourseStatus } from '@shared/models/formation.model';
import { SimpleImageUploadComponent } from '@shared/components/simple-image-upload/simple-image-upload.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-formations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SimpleImageUploadComponent, ConfirmDialogComponent],
  templateUrl: './admin-formations.component.html',
  styleUrls: ['./admin-formations.component.css']
})
export class AdminFormationsComponent implements OnInit {
  courses: Course[] = [];
  loading = false;
  showModal = false;
  editMode = false;
  
  courseForm!: FormGroup;
  editingId?: number;
  
  levels = Object.values(CourseLevel);
  statuses = Object.values(CourseStatus);

  // Confirm dialog
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  pendingDeleteCourse?: Course;

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
  }

  initForm(): void {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      level: [CourseLevel.BEGINNER, Validators.required],
      language: ['Français', Validators.required],
      durationMinutes: [60, [Validators.required, Validators.min(1)]],
      thumbnailUrl: ['']
    });
  }

  loadCourses(): void {
    this.loading = true;
    this.formationService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.editMode = false;
    this.courseForm.reset({
      level: CourseLevel.BEGINNER,
      language: 'Français',
      durationMinutes: 60
    });
    this.showModal = true;
  }

  openEditModal(course: Course): void {
    this.editMode = true;
    this.editingId = course.id;
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      level: course.level,
      language: course.language,
      durationMinutes: course.durationMinutes,
      thumbnailUrl: course.thumbnailUrl
    });
    this.showModal = true;
  }

  saveCourse(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.courseForm.controls).forEach(key => {
      this.courseForm.get(key)?.markAsTouched();
    });

    if (this.courseForm.invalid) {
      return;
    }

    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.toastService.error('Vous devez être connecté');
        return;
      }

      const request: CourseRequest = {
        ...this.courseForm.value,
        createdBy: user.idUser
      };

      console.log('📤 Sending course request:', request);

      if (this.editMode && this.editingId) {
        this.formationService.updateCourse(this.editingId, request).subscribe({
          next: () => {
            console.log('✅ Course updated');
            this.toastService.success('Formation mise à jour avec succès');
            this.closeModal();
            this.loadCourses();
          },
          error: (err) => {
            console.error('❌ Error updating:', err);
            this.toastService.error('Erreur lors de la mise à jour');
          }
        });
      } else {
        this.formationService.createCourse(request).subscribe({
          next: () => {
            console.log('✅ Course created');
            this.toastService.success('Formation créée avec succès');
            this.closeModal();
            this.loadCourses();
          },
          error: (err) => {
            console.error('❌ Error creating:', err);
            this.toastService.error('Erreur lors de la création');
          }
        });
      }
    }).unsubscribe();
  }

  publishCourse(id: number): void {
    this.formationService.publishCourse(id).subscribe({
      next: () => {
        this.toastService.success('Formation publiée avec succès');
        this.loadCourses();
      },
      error: (err) => {
        console.error('Error publishing:', err);
        this.toastService.error('Erreur lors de la publication');
      }
    });
  }

  deleteCourse(course: Course): void {
    this.pendingDeleteCourse = course;
    this.confirmDialogTitle = 'Supprimer la formation';
    this.confirmDialogMessage = `Êtes-vous sûr de vouloir supprimer la formation "${course.title}" ? Cette action est irréversible.`;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.pendingDeleteCourse) return;

    this.formationService.deleteCourse(this.pendingDeleteCourse.id).subscribe({
      next: () => {
        this.toastService.success('Formation supprimée avec succès');
        this.loadCourses();
        this.showConfirmDialog = false;
        this.pendingDeleteCourse = undefined;
      },
      error: (err) => {
        console.error('Error deleting:', err);
        this.toastService.error('Erreur lors de la suppression');
        this.showConfirmDialog = false;
        this.pendingDeleteCourse = undefined;
      }
    });
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.pendingDeleteCourse = undefined;
  }

  onImageSelected(base64: string): void {
    this.courseForm.patchValue({ thumbnailUrl: base64 });
  }

  getFieldError(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (!field?.touched) return '';
    
    if (field.hasError('required')) return 'Ce champ est obligatoire';
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength')?.requiredLength ?? 0;
      return `Minimum ${minLength} caractères requis`;
    }
    if (field.hasError('min')) {
      const min = field.getError('min')?.min ?? 0;
      return `La valeur doit être au moins ${min}`;
    }
    return '';
  }

  closeModal(): void {
    this.showModal = false;
    this.courseForm.reset();
  }
}
