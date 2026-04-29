import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import {
  AdminUsersApiService,
  UserResponse,
  BackendRole,
  AdminCreateUserRequest,
  AdminUpdateUserRequest
} from './admin-users-api.service';

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  // UI state
  isLoading = false;
  errorMsg = '';

  searchQuery = '';
  selectedStatus: StatusFilter = 'all';
  selectedRole: 'all' | BackendRole = 'all';

  // data
  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];

  // modal state
  showCreateModal = false;
  showEditModal = false;
  showResetPasswordModal = false;

  // forms
  createForm!: FormGroup;
  editForm!: FormGroup;
  resetPasswordForm!: FormGroup;

  editTarget: UserResponse | null = null;
  resetTarget: UserResponse | null = null;

  roles: BackendRole[] = ['ADMIN', 'FORMATEUR', 'APPRENANT', 'RH_ENTREPRISE'];

  // Confirm dialog
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  pendingDeleteUser?: UserResponse;

  constructor(
    private fb: FormBuilder,
    private api: AdminUsersApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadUsers();
  }

  initForms(): void {
    this.createForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['APPRENANT', Validators.required],
      phone: ['', [Validators.pattern(/^[0-9]{8,15}$/)]],
      adresse: [''],
      isActive: [true]
    });

    this.editForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{8,15}$/)]],
      adresse: ['']
    });

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMsg = '';

    this.api.list().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.isLoading = false;
        this.filterUsers();
      },
      error: () => {
        this.isLoading = false;
        this.errorMsg = 'Failed to load users.';
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  // ---------- filtering ----------
  filterUsers() {
    const q = this.searchQuery.trim().toLowerCase();

    this.filteredUsers = this.users.filter(u => {
      const fullName = `${u.prenom ?? ''} ${u.nom ?? ''}`.toLowerCase();
      const email = (u.email ?? '').toLowerCase();

      const matchesSearch = !q || fullName.includes(q) || email.includes(q);

      const isActive = !!u.isActive;
      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && isActive) ||
        (this.selectedStatus === 'inactive' && !isActive);

      const matchesRole =
        this.selectedRole === 'all' || u.role === this.selectedRole;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }

  onSearch() { this.filterUsers(); }
  onStatusChange() { this.filterUsers(); }
  onRoleChange() { this.filterUsers(); }

  // ---------- UI helpers ----------
  initials(u: UserResponse): string {
    const a = (u.prenom?.charAt(0) ?? '').toUpperCase();
    const b = (u.nom?.charAt(0) ?? '').toUpperCase();
    return (a + b) || (u.email?.charAt(0)?.toUpperCase() ?? '?');
  }

  joinDate(u: UserResponse): string {
    if (!u.createdAt) return '-';
    // keep it simple (yyyy-mm-dd)
    return String(u.createdAt).slice(0, 10);
  }

  getRoleColor(role: BackendRole): string {
    const colors: Record<BackendRole, string> = {
      ADMIN: 'danger',
      FORMATEUR: 'warning',
      RH_ENTREPRISE: 'warning',
      APPRENANT: 'info',
      MANAGER: 'primary'
    };
    return colors[role] ?? 'info';
  }

  // ---------- Create ----------
  openCreate() {
    this.createForm.reset({
      role: 'APPRENANT',
      isActive: true
    });
    this.showCreateModal = true;
  }

  closeCreate() { this.showCreateModal = false; }

  submitCreate() {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.createForm.controls).forEach(key => {
      this.createForm.get(key)?.markAsTouched();
    });

    if (this.createForm.invalid) {
      return;
    }

    const request: AdminCreateUserRequest = this.createForm.value;

    this.api.create(request).subscribe({
      next: () => {
        this.toastService.success('Utilisateur créé avec succès');
        this.showCreateModal = false;
        this.loadUsers();
      },
      error: (e) => {
        this.toastService.error(e?.error?.message ?? 'Échec de la création');
      }
    });
  }

  // ---------- Edit ----------
  editUser(u: UserResponse) {
    this.editTarget = u;
    this.editForm.patchValue({
      nom: u.nom ?? '',
      prenom: u.prenom ?? '',
      email: u.email ?? '',
      phone: u.phone ?? '',
      adresse: u.adresse ?? ''
    });
    this.showEditModal = true;
  }

  closeEdit() { 
    this.showEditModal = false; 
    this.editTarget = null; 
  }

  submitEdit() {
    if (!this.editTarget) return;

    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });

    if (this.editForm.invalid) {
      return;
    }

    const request: AdminUpdateUserRequest = this.editForm.value;

    this.api.update(this.editTarget.idUser, request).subscribe({
      next: () => {
        this.toastService.success('Utilisateur mis à jour avec succès');
        this.showEditModal = false;
        this.editTarget = null;
        this.loadUsers();
      },
      error: (e) => this.toastService.error(e?.error?.message ?? 'Échec de la mise à jour')
    });
  }

  // ---------- Role / Active quick actions ----------
  changeRole(u: UserResponse, role: BackendRole) {
    if (u.role === role) return;
    this.api.setRole(u.idUser, role).subscribe({
      next: () => {
        this.toastService.success('Rôle modifié avec succès');
        this.loadUsers();
      },
      error: (e) => this.toastService.error(e?.error?.message ?? 'Échec de la modification du rôle')
    });
  }

  toggleActive(u: UserResponse) {
    const next = !u.isActive;
    this.api.setActive(u.idUser, next).subscribe({
      next: () => {
        this.toastService.success(`Utilisateur ${next ? 'activé' : 'désactivé'} avec succès`);
        this.loadUsers();
      },
      error: (e) => this.toastService.error(e?.error?.message ?? 'Échec de la modification du statut')
    });
  }

  // ---------- Reset password ----------
  openResetPassword(u: UserResponse) {
    this.resetTarget = u;
    this.resetPasswordForm.reset();
    this.showResetPasswordModal = true;
  }

  closeResetPassword() {
    this.showResetPasswordModal = false;
    this.resetTarget = null;
  }

  submitResetPassword() {
    if (!this.resetTarget) return;

    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      this.resetPasswordForm.get(key)?.markAsTouched();
    });

    if (this.resetPasswordForm.invalid) {
      return;
    }

    const { newPassword, confirmPassword } = this.resetPasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.toastService.error('Les mots de passe ne correspondent pas');
      return;
    }

    this.api.resetPassword(this.resetTarget.idUser, { newPassword }).subscribe({
      next: () => {
        this.toastService.success('Mot de passe réinitialisé avec succès');
        this.showResetPasswordModal = false;
        this.resetTarget = null;
      },
      error: (e) => this.toastService.error(e?.error?.message ?? 'Échec de la réinitialisation')
    });
  }

  // ---------- Delete ----------
  deleteUser(u: UserResponse) {
    const name = `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email;
    this.pendingDeleteUser = u;
    this.confirmDialogTitle = 'Supprimer l\'utilisateur';
    this.confirmDialogMessage = `Êtes-vous sûr de vouloir supprimer l'utilisateur "${name}" ? Cette action est irréversible.`;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.pendingDeleteUser) return;

    this.api.delete(this.pendingDeleteUser.idUser).subscribe({
      next: () => {
        this.toastService.success('Utilisateur supprimé avec succès');
        this.loadUsers();
        this.showConfirmDialog = false;
        this.pendingDeleteUser = undefined;
      },
      error: (e) => {
        this.toastService.error('Erreur lors de la suppression');
        this.showConfirmDialog = false;
        this.pendingDeleteUser = undefined;
      }
    });
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.pendingDeleteUser = undefined;
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field?.touched) return '';
    
    if (field.hasError('required')) return 'Ce champ est obligatoire';
    if (field.hasError('email')) return 'Email invalide';
    if (field.hasError('pattern')) {
      if (fieldName === 'phone') return 'Numéro de téléphone invalide (8-15 chiffres)';
      return 'Format invalide';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength')?.requiredLength ?? 0;
      return `Minimum ${minLength} caractères requis`;
    }
    return '';
  }
}