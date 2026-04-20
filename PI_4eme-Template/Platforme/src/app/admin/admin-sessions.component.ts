import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormationService } from '@core/services/formation.service';
import { ToastService } from '@core/services/toast.service';
import { Course, Session, SessionRequest, CourseStatus, SessionStatus } from '@shared/models/formation.model';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { SessionParticipantsModalComponent } from './session-participants-modal.component';

@Component({
  selector: 'app-admin-sessions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent, SessionParticipantsModalComponent],
  templateUrl: './admin-sessions.component.html',
  styleUrls: ['./admin-sessions.component.css']
})
export class AdminSessionsComponent implements OnInit {
  courses: Course[] = [];
  sessions: Session[] = [];
  selectedCourseId?: number;
  loading = false;
  showModal = false;
  
  sessionForm!: FormGroup;
  
  // Expose enum to template
  SessionStatus = SessionStatus;

  // Confirm dialog
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  pendingDeleteSession?: Session;

  // Participants modal
  showParticipantsModal = false;
  selectedSessionId?: number;

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
    this.loadAllSessions();
  }

  initForm(): void {
    this.sessionForm = this.fb.group({
      courseId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      daysOfWeek: this.fb.group({
        monday: [false],
        tuesday: [false],
        wednesday: [false],
        thursday: [false],
        friday: [false],
        saturday: [false]
      }),
      capacity: [30, [Validators.required, Validators.min(1)]]
    });
  }

  loadCourses(): void {
    this.loading = true;
    this.formationService.getCourses(CourseStatus.PUBLISHED).subscribe({
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

  onCourseSelect(courseId: number): void {
    this.selectedCourseId = courseId;
    if (courseId) {
      this.loadSessions(courseId);
    } else {
      this.loadAllSessions();
    }
  }

  loadSessions(courseId: number): void {
    this.loading = true;
    this.formationService.getCourseSessions(courseId).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.loading = false;
      }
    });
  }

  loadAllSessions(): void {
    this.loading = true;
    this.formationService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions.sort((a, b) => 
          new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    if (!this.selectedCourseId) {
      this.toastService.error('Veuillez sélectionner une formation');
      return;
    }
    this.sessionForm.patchValue({ courseId: this.selectedCourseId });
    this.showModal = true;
  }

  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.title : `Formation #${courseId}`;
  }

  saveSession(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.sessionForm.controls).forEach(key => {
      this.sessionForm.get(key)?.markAsTouched();
    });

    if (this.sessionForm.invalid) {
      return;
    }

    const { courseId, startDate, endDate, capacity } = this.sessionForm.value;

    // Validation: date de fin après date de début
    if (new Date(endDate) < new Date(startDate)) {
      this.toastService.error('La date de fin doit être après ou égale à la date de début');
      return;
    }

    // Créer avec horaires et fuseau horaire par défaut (9h-17h, Europe/Paris)
    const startAt = `${startDate}T09:00:00`;
    const endAt = `${endDate}T17:00:00`;

    const request: SessionRequest = {
      startAt,
      endAt,
      timezone: 'Europe/Paris',
      capacity
    };

    this.formationService.createSession(courseId, request).subscribe({
      next: () => {
        this.toastService.success('Session créée avec succès');
        this.closeModal();
        this.loadSessions(courseId);
      },
      error: (err) => {
        console.error('Error creating session:', err);
        this.toastService.error('Erreur lors de la création de la session');
      }
    });
  }

  openSession(sessionId: number): void {
    this.formationService.openSession(sessionId).subscribe({
      next: () => {
        this.toastService.success('Session ouverte aux inscriptions');
        if (this.selectedCourseId) {
          this.loadSessions(this.selectedCourseId);
        }
      },
      error: (err) => {
        console.error('Error opening session:', err);
        this.toastService.error('Erreur lors de l\'ouverture de la session');
      }
    });
  }

  closeSession(sessionId: number): void {
    this.formationService.closeSession(sessionId).subscribe({
      next: () => {
        this.toastService.success('Session fermée');
        if (this.selectedCourseId) {
          this.loadSessions(this.selectedCourseId);
        }
      },
      error: (err) => {
        console.error('Error closing session:', err);
        this.toastService.error('Erreur lors de la fermeture de la session');
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.sessionForm.reset({ 
      capacity: 30,
      daysOfWeek: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false
      }
    });
  }

  toggleSessionStatus(session: Session): void {
    if (session.status === SessionStatus.PLANNED || session.status === SessionStatus.CLOSED) {
      // PLANNED ou CLOSED → Ouvrir
      this.openSession(session.id);
    } else if (session.status === SessionStatus.OPEN) {
      // OPEN → Fermer
      this.closeSession(session.id);
    }
  }

  deleteSession(session: Session): void {
    this.pendingDeleteSession = session;
    this.confirmDialogTitle = 'Supprimer la session';
    this.confirmDialogMessage = `Êtes-vous sûr de vouloir supprimer la session #${session.id} ? Cette action est irréversible.`;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.pendingDeleteSession) return;

    this.formationService.deleteSession(this.pendingDeleteSession.id).subscribe({
      next: () => {
        this.toastService.success('Session supprimée avec succès');
        if (this.selectedCourseId) {
          this.loadSessions(this.selectedCourseId);
        } else {
          this.loadAllSessions();
        }
        this.showConfirmDialog = false;
        this.pendingDeleteSession = undefined;
      },
      error: (err) => {
        console.error('Error deleting session:', err);
        this.toastService.error('Erreur lors de la suppression');
        this.showConfirmDialog = false;
        this.pendingDeleteSession = undefined;
      }
    });
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.pendingDeleteSession = undefined;
  }

  getFieldError(fieldName: string): string {
    const field = this.sessionForm.get(fieldName);
    if (!field?.touched) return '';
    
    if (field.hasError('required')) return 'Ce champ est obligatoire';
    if (field.hasError('min')) {
      const min = field.getError('min')?.min ?? 0;
      return `La valeur doit être au moins ${min}`;
    }
    return '';
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  viewParticipants(session: Session): void {
    this.selectedSessionId = session.id;
    this.showParticipantsModal = true;
  }

  closeParticipantsModal(): void {
    this.showParticipantsModal = false;
    this.selectedSessionId = undefined;
  }
}
