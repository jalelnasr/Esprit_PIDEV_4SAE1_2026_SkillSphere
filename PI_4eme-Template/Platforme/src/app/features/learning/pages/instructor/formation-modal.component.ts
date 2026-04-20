import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormationService } from '@core/services/formation.service';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { Course, CourseRequest } from '@shared/models';
import { SimpleImageUploadComponent } from '../../../../shared/components/simple-image-upload/simple-image-upload.component';

@Component({
  selector: 'app-formation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SimpleImageUploadComponent],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Modifier la Formation' : 'Créer une Formation' }}</h2>
          <button class="btn-close" (click)="onClose()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form [formGroup]="formationForm" (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <!-- Title -->
            <div class="form-group">
              <label for="title">Titre <span class="required">*</span></label>
              <input
                id="title"
                type="text"
                formControlName="title"
                placeholder="Ex: Introduction à Angular"
                [class.error]="formationForm.get('title')?.invalid && formationForm.get('title')?.touched"
              />
              <div class="error-message" *ngIf="formationForm.get('title')?.invalid && formationForm.get('title')?.touched">
                <span *ngIf="formationForm.get('title')?.errors?.['required']">Le titre est requis</span>
                <span *ngIf="formationForm.get('title')?.errors?.['maxlength']">Maximum 200 caractères</span>
              </div>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="description">Description <span class="required">*</span></label>
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                placeholder="Décrivez votre formation..."
                [class.error]="formationForm.get('description')?.invalid && formationForm.get('description')?.touched"
              ></textarea>
              <div class="error-message" *ngIf="formationForm.get('description')?.invalid && formationForm.get('description')?.touched">
                <span *ngIf="formationForm.get('description')?.errors?.['required']">La description est requise</span>
                <span *ngIf="formationForm.get('description')?.errors?.['maxlength']">Maximum 2000 caractères</span>
              </div>
            </div>

            <!-- Level -->
            <div class="form-group">
              <label for="level">Niveau <span class="required">*</span></label>
              <select
                id="level"
                formControlName="level"
                [class.error]="formationForm.get('level')?.invalid && formationForm.get('level')?.touched"
              >
                <option value="">Sélectionnez un niveau</option>
                <option value="BEGINNER">Débutant</option>
                <option value="INTERMEDIATE">Intermédiaire</option>
                <option value="ADVANCED">Avancé</option>
              </select>
              <div class="error-message" *ngIf="formationForm.get('level')?.invalid && formationForm.get('level')?.touched">
                Le niveau est requis
              </div>
            </div>

            <!-- Language -->
            <div class="form-group">
              <label for="language">Langue <span class="required">*</span></label>
              <select
                id="language"
                formControlName="language"
                [class.error]="formationForm.get('language')?.invalid && formationForm.get('language')?.touched"
              >
                <option value="">Sélectionnez une langue</option>
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="ar">Arabe</option>
              </select>
              <div class="error-message" *ngIf="formationForm.get('language')?.invalid && formationForm.get('language')?.touched">
                La langue est requise
              </div>
            </div>

            <!-- Duration -->
            <div class="form-group">
              <label for="durationMinutes">Durée (minutes) <span class="required">*</span></label>
              <input
                id="durationMinutes"
                type="number"
                formControlName="durationMinutes"
                placeholder="Ex: 120"
                min="1"
                [class.error]="formationForm.get('durationMinutes')?.invalid && formationForm.get('durationMinutes')?.touched"
              />
              <div class="error-message" *ngIf="formationForm.get('durationMinutes')?.invalid && formationForm.get('durationMinutes')?.touched">
                <span *ngIf="formationForm.get('durationMinutes')?.errors?.['required']">La durée est requise</span>
                <span *ngIf="formationForm.get('durationMinutes')?.errors?.['min']">La durée doit être supérieure à 0</span>
              </div>
            </div>

            <!-- Thumbnail Image -->
            <div class="form-group">
              <label for="thumbnailUrl">Image de la formation</label>
              <app-simple-image-upload 
                [currentImageUrl]="formationForm.get('thumbnailUrl')?.value"
                (imageSelected)="onImageSelected($event)">
              </app-simple-image-upload>
              <small class="help-text">Téléchargez une image de couverture pour votre formation</small>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="onClose()">
              Annuler
            </button>
            <button type="submit" class="btn-primary" [disabled]="formationForm.invalid || saving">
              <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
              {{ saving ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
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
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .required {
      color: #f44336;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .form-group input.error,
    .form-group textarea.error,
    .form-group select.error {
      border-color: #f44336;
    }

    .error-message {
      color: #f44336;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .help-text {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: block;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #eee;
    }

    .btn-secondary,
    .btn-primary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #45a049;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class FormationModalComponent implements OnInit {
  @Input() formation?: Course;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Course>();

  formationForm!: FormGroup;
  saving = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.formation;
    this.initForm();
  }

  initForm(): void {
    this.formationForm = this.fb.group({
      title: [this.formation?.title || '', [Validators.required, Validators.maxLength(200)]],
      description: [this.formation?.description || '', [Validators.required, Validators.maxLength(2000)]],
      level: [this.formation?.level || '', Validators.required],
      language: [this.formation?.language || 'fr', Validators.required],
      durationMinutes: [this.formation?.durationMinutes || 60, [Validators.required, Validators.min(1)]],
      thumbnailUrl: [this.formation?.thumbnailUrl || '']
    });
  }

  onSubmit(): void {
    if (this.formationForm.invalid) {
      Object.keys(this.formationForm.controls).forEach(key => {
        this.formationForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Get current user ID
    let currentUserId: number | undefined;
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        currentUserId = user.idUser;
      }
    }).unsubscribe();

    if (!currentUserId) {
      this.toastService.error('Utilisateur non authentifié');
      return;
    }

    this.saving = true;
    const formData: CourseRequest = {
      ...this.formationForm.value,
      createdBy: currentUserId
    };

    const request$ = this.isEditMode && this.formation
      ? this.formationService.updateCourse(this.formation.id, formData)
      : this.formationService.createCourse(formData);

    request$.subscribe({
      next: (course: Course) => {
        this.toastService.success(
          this.isEditMode ? 'Formation modifiée avec succès' : 'Formation créée avec succès'
        );
        this.saved.emit(course);
        this.onClose();
      },
      error: (error: any) => {
        console.error('Error saving formation:', error);
        this.toastService.error(
          this.isEditMode ? 'Erreur lors de la modification' : 'Erreur lors de la création'
        );
        this.saving = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onImageSelected(imageUrl: string): void {
    this.formationForm.patchValue({ thumbnailUrl: imageUrl });
  }
}
