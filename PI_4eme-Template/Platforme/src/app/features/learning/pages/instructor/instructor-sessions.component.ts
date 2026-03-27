import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../../../core/services/formation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Course, Session, SessionRequest, SessionStatus } from '../../../../shared/models/formation.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MeetSidebarComponent } from '../../../../shared/components/meet-sidebar/meet-sidebar.component';
import { MeetService, MeetRequest } from '../../../../core/services/meet.service';

interface SessionDisplay extends Session {
  courseTitle: string;
  location?: string;
}

@Component({
  selector: 'app-instructor-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogComponent, MeetSidebarComponent],
  templateUrl: './instructor-sessions.component.html',
  styleUrls: ['./instructor-sessions.component.css']
})
export class InstructorSessionsComponent implements OnInit {
  sessions: SessionDisplay[] = [];
  filteredSessions: SessionDisplay[] = [];
  formations: Course[] = [];
  loading = true;
  showModal = false;
  sessionForm!: FormGroup;
  isEditMode = false;
  editingSessionId?: number;

  // Filters
  selectedStatus: string = 'All';
  searchQuery = '';

  statuses = ['All', 'PLANNED', 'OPEN', 'CLOSED', 'CANCELED'];
  
  // Expose enum to template
  SessionStatus = SessionStatus;

  // Confirm dialog
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  pendingDeleteSession?: SessionDisplay;

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private authService: AuthService,
    private toastService: ToastService,
    private meetService: MeetService
  ) {}

  // ── Meet scheduling ────────────────────────────────────────────────────────
  showMeetModal = false;
  meetSessionId?: number;
  meetTitle = '';
  meetDescription = '';
  meetScheduledAt = '';
  meetDuration = 60;

  openScheduleMeet(session: SessionDisplay): void {
    this.meetSessionId = session.id;
    this.meetTitle = `${session.courseTitle} — Meet`;
    this.meetDescription = '';
    this.meetScheduledAt = new Date(session.startAt).toISOString().slice(0, 16);
    this.meetDuration = 60;
    this.showMeetModal = true;
  }

  saveMeet(): void {
    if (!this.meetSessionId || !this.meetTitle || !this.meetScheduledAt) {
      this.toastService.error('Veuillez remplir tous les champs');
      return;
    }
    const req: MeetRequest = {
      title: this.meetTitle,
      description: this.meetDescription,
      scheduledAt: new Date(this.meetScheduledAt).toISOString().slice(0, 19),
      durationMinutes: this.meetDuration
    };
    this.meetService.createMeet(this.meetSessionId, req).subscribe({
      next: (meet) => {
        this.toastService.success('Meet planifié! Lien: ' + meet.meetLink);
        this.showMeetModal = false;
      },
      error: () => this.toastService.error('Erreur lors de la création du meet')
    });
  }

  closeMeetModal(): void { this.showMeetModal = false; }

  ngOnInit(): void {
    this.initForm();
    this.loadFormations();
    this.loadSessions();
  }

  initForm(): void {
    this.sessionForm = this.fb.group({
      courseId: ['', Validators.required],
      startAt: ['', Validators.required],
      endAt: ['', Validators.required],
      timezone: ['Africa/Casablanca', Validators.required],
      location: [''],
      capacity: [30, [Validators.required, Validators.min(1), Validators.max(1000)]]
    });
  }

  loadFormations(): void {
    this.authService.currentUser$.subscribe(currentUser => {
      if (!currentUser) {
        console.log('❌ No current user found');
        return;
      }

      console.log('👤 Current user ID:', currentUser.idUser);

      // Charger toutes les formations et filtrer côté frontend
      this.formationService.getCourses().subscribe({
        next: (formations) => {
          console.log('📚 All formations received:', formations.length);
          console.log('📋 Sample formation:', formations[0]);
          
          // Filtrer pour ne garder que les formations du formateur
          this.formations = formations.filter(f => {
            console.log(`Comparing: formation.createdBy (${f.createdBy}) === currentUser.idUser (${currentUser.idUser})`);
            return f.createdBy === currentUser.idUser;
          });
          
          console.log('✅ Filtered formations for instructor:', this.formations.length);
          console.log('📋 Instructor formations:', this.formations);
        },
        error: (error) => {
          console.error('Error loading formations:', error);
          this.toastService.error('Erreur lors du chargement des formations');
        }
      });
    });
  }

  loadSessions(): void {
    this.loading = true;
    
    this.authService.currentUser$.subscribe(currentUser => {
      if (!currentUser) {
        this.loading = false;
        return;
      }

      this.formationService.getInstructorSessions(currentUser.idUser).subscribe({
        next: (sessions: any[]) => {
          this.sessions = sessions;
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading sessions:', error);
          this.sessions = [];
          this.filteredSessions = [];
          this.loading = false;
          this.toastService.error('Erreur lors du chargement des sessions');
        }
      });
    });
  }

  applyFilters(): void {
    this.filteredSessions = this.sessions.filter(session => {
      const matchStatus = this.selectedStatus === 'All' || session.status === this.selectedStatus;
      const matchSearch = !this.searchQuery || 
        session.courseTitle.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (session.location && session.location.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      return matchStatus && matchSearch;
    });
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PLANNED': return 'badge-planned';
      case 'OPEN': return 'badge-in-progress';
      case 'CLOSED': return 'badge-completed';
      case 'CANCELED': return 'badge-cancelled';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PLANNED': return 'Planifiée';
      case 'OPEN': return 'Ouverte';
      case 'CLOSED': return 'Fermée';
      case 'CANCELED': return 'Annulée';
      default: return status;
    }
  }

  getCapacityPercentage(session: SessionDisplay): number {
    return (session.enrolledCount / session.capacity) * 100;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  createSession(): void {
    this.isEditMode = false;
    this.editingSessionId = undefined;
    this.sessionForm.reset({
      timezone: 'Africa/Casablanca',
      capacity: 30
    });
    this.showModal = true;
  }

  saveSession(): void {
    Object.keys(this.sessionForm.controls).forEach(key => {
      this.sessionForm.get(key)?.markAsTouched();
    });

    if (this.sessionForm.invalid) {
      this.toastService.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const formValue = this.sessionForm.value;

    // Validation: date de fin après date de début
    if (new Date(formValue.endAt) < new Date(formValue.startAt)) {
      this.toastService.error('La date de fin doit être après la date de début');
      return;
    }

    const request: SessionRequest = {
      startAt: formValue.startAt,
      endAt: formValue.endAt,
      timezone: formValue.timezone,
      location: formValue.location,
      capacity: formValue.capacity
    };

    if (this.isEditMode && this.editingSessionId) {
      // Mode édition
      this.formationService.updateSession(this.editingSessionId, request).subscribe({
        next: () => {
          this.toastService.success('Session modifiée avec succès!');
          this.closeModal();
          this.loadSessions();
        },
        error: (error) => {
          console.error('Error updating session:', error);
          this.toastService.error('Erreur lors de la modification de la session');
        }
      });
    } else {
      // Mode création
      this.formationService.createSession(formValue.courseId, request).subscribe({
        next: () => {
          this.toastService.success('Session créée avec succès!');
          this.closeModal();
          this.loadSessions();
        },
        error: (error) => {
          console.error('Error creating session:', error);
          this.toastService.error('Erreur lors de la création de la session');
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.editingSessionId = undefined;
    this.sessionForm.reset({
      timezone: 'Africa/Casablanca',
      capacity: 30
    });
  }

  editSession(session: SessionDisplay): void {
    this.isEditMode = true;
    this.editingSessionId = session.id;
    
    // Formater les dates pour l'input datetime-local
    const startAt = new Date(session.startAt).toISOString().slice(0, 16);
    const endAt = new Date(session.endAt).toISOString().slice(0, 16);
    
    this.sessionForm.patchValue({
      courseId: session.courseId,
      startAt: startAt,
      endAt: endAt,
      timezone: session.timezone || 'Africa/Casablanca',
      location: session.location || '',
      capacity: session.capacity
    });
    
    this.showModal = true;
  }

  deleteSession(session: SessionDisplay): void {
    this.pendingDeleteSession = session;
    this.confirmDialogTitle = 'Supprimer la session';
    this.confirmDialogMessage = `Êtes-vous sûr de vouloir supprimer la session "${session.courseTitle}" du ${this.formatDate(session.startAt)} ? Cette action est irréversible.`;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.pendingDeleteSession) return;

    this.formationService.deleteSession(this.pendingDeleteSession.id).subscribe({
      next: () => {
        this.toastService.success('Session supprimée avec succès');
        this.loadSessions();
        this.showConfirmDialog = false;
        this.pendingDeleteSession = undefined;
      },
      error: (error) => {
        console.error('Error deleting session:', error);
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

  openSession(sessionId: number): void {
    this.formationService.openSession(sessionId).subscribe({
      next: () => {
        this.toastService.success('Session ouverte aux inscriptions');
        this.loadSessions();
      },
      error: (error) => {
        console.error('Error opening session:', error);
        this.toastService.error('Erreur lors de l\'ouverture de la session');
      }
    });
  }

  closeSession(sessionId: number): void {
    this.formationService.closeSession(sessionId).subscribe({
      next: () => {
        this.toastService.success('Session fermée');
        this.loadSessions();
      },
      error: (error) => {
        console.error('Error closing session:', error);
        this.toastService.error('Erreur lors de la fermeture de la session');
      }
    });
  }

  toggleSessionStatus(session: SessionDisplay): void {
    if (session.status === 'PLANNED' || session.status === 'CLOSED') {
      // PLANNED ou CLOSED → Ouvrir
      this.openSession(session.id);
    } else if (session.status === 'OPEN') {
      // OPEN → Fermer
      this.closeSession(session.id);
    }
  }

  viewParticipants(session: SessionDisplay): void {
    this.toastService.info('Fonctionnalité de visualisation des participants à venir');
  }

  getFieldError(fieldName: string): string {
    const field = this.sessionForm.get(fieldName);
    if (!field?.touched) return '';
    
    if (field.hasError('required')) return 'Ce champ est obligatoire';
    if (field.hasError('min')) {
      const min = field.getError('min')?.min ?? 0;
      return `La valeur doit être au moins ${min}`;
    }
    if (field.hasError('max')) {
      const max = field.getError('max')?.max ?? 0;
      return `La valeur ne peut pas dépasser ${max}`;
    }
    return '';
  }

  get minDateTime(): string {
    return new Date().toISOString().slice(0, 16);
  }
}

