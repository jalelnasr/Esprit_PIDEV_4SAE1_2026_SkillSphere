import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminUsersApiService,
  UserResponse,
  BackendRole,
  AdminCreateUserRequest,
  AdminUpdateUserRequest
} from './admin-users-api.service';
import { CompanyService, Company } from '../core/services/company.service';

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  currentPage = 1;
  pageSize = 20;

  // modal state
  showCreateModal = false;
  showEditModal = false;
  showResetPasswordModal = false;

  // forms (simple)
  createForm: AdminCreateUserRequest = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'APPRENANT',
    phone: '',
    adresse: '',
    isActive: true,
    companyId: null
  };

  editTarget: UserResponse | null = null;
  editForm: AdminUpdateUserRequest = {
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    adresse: '',
    companyId: null
  };

  resetTarget: UserResponse | null = null;
  resetPassword = '';
  resetPassword2 = '';

  roles: BackendRole[] = ['ADMIN', 'FORMATEUR', 'APPRENANT', 'RH_ENTREPRISE', 'MANAGER'];

  // Company data
  companies: Company[] = [];
  companiesLoading = false;

  constructor(private api: AdminUsersApiService, private companyService: CompanyService) {}

  ngOnInit() {
    this.loadUsers();
    this.loadCompanies();
  }

  loadCompanies() {
    this.companiesLoading = true;
    this.companyService.getAll().subscribe({
      next: (data) => {
        this.companies = data ?? [];
        this.companiesLoading = false;
      },
      error: () => {
        this.companies = [];
        this.companiesLoading = false;
      }
    });
  }

  /** Returns true if the given role requires a companyId */
  needsCompany(role: string): boolean {
    return role === 'RH_ENTREPRISE' || role === 'MANAGER';
  }

  /** Called when the create form role changes */
  onCreateRoleChange() {
    if (!this.needsCompany(this.createForm.role)) {
      this.createForm.companyId = null;
    }
  }

  /** Get company name by id */
  companyName(companyId: number | null | undefined): string {
    if (!companyId) return '-';
    const c = this.companies.find(co => co.id === companyId);
    return c ? c.name : `#${companyId}`;
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

    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  get visibleUsers(): UserResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  trackByUserId(_: number, user: UserResponse): number {
    return user.idUser;
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
      MANAGER: 'purple'
    };
    return colors[role] ?? 'info';
  }

  // ---------- Create ----------
  openCreate() {
    this.createForm = {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'APPRENANT',
      phone: '',
      adresse: '',
      isActive: true,
      companyId: null
    };
    this.showCreateModal = true;
  }

  closeCreate() { this.showCreateModal = false; }

  submitCreate() {
    if (!this.createForm.nom || !this.createForm.prenom || !this.createForm.email || !this.createForm.password) {
      alert('Please fill: last name, first name, email, password');
      return;
    }
    if (this.needsCompany(this.createForm.role) && !this.createForm.companyId) {
      alert('Please select a company for this role');
      return;
    }

    this.api.create(this.createForm).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loadUsers();
      },
      error: (e) => {
        alert(e?.error?.message ?? 'Create failed');
      }
    });
  }

  // ---------- Edit ----------
  editUser(u: UserResponse) {
    this.editTarget = u;
    this.editForm = {
      nom: u.nom ?? '',
      prenom: u.prenom ?? '',
      email: u.email ?? '',
      phone: u.phone ?? '',
      adresse: u.adresse ?? '',
      companyId: u.companyId ?? null
    };
    this.showEditModal = true;
  }

  closeEdit() { this.showEditModal = false; this.editTarget = null; }

  submitEdit() {
    if (!this.editTarget) return;

    this.api.update(this.editTarget.idUser, this.editForm).subscribe({
      next: () => {
        this.showEditModal = false;
        this.editTarget = null;
        this.loadUsers();
      },
      error: (e) => alert(e?.error?.message ?? 'Update failed')
    });
  }

  // ---------- Role / Active quick actions ----------
  changeRole(u: UserResponse, role: BackendRole) {
    if (u.role === role) return;
    this.api.setRole(u.idUser, role).subscribe({
      next: () => this.loadUsers(),
      error: (e) => alert(e?.error?.message ?? 'Role update failed')
    });
  }

  toggleActive(u: UserResponse) {
    const next = !u.isActive;
    this.api.setActive(u.idUser, next).subscribe({
      next: () => this.loadUsers(),
      error: (e) => alert(e?.error?.message ?? 'Active update failed')
    });
  }

  // ---------- Reset password ----------
  openResetPassword(u: UserResponse) {
    this.resetTarget = u;
    this.resetPassword = '';
    this.resetPassword2 = '';
    this.showResetPasswordModal = true;
  }

  closeResetPassword() {
    this.showResetPasswordModal = false;
    this.resetTarget = null;
  }

  submitResetPassword() {
    if (!this.resetTarget) return;
    if (!this.resetPassword || this.resetPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    if (this.resetPassword !== this.resetPassword2) {
      alert('Passwords do not match');
      return;
    }

    this.api.resetPassword(this.resetTarget.idUser, { newPassword: this.resetPassword }).subscribe({
      next: () => {
        this.showResetPasswordModal = false;
        this.resetTarget = null;
        alert('Password reset successfully');
      },
      error: (e) => alert(e?.error?.message ?? 'Reset password failed')
    });
  }

  // ---------- Delete ----------
  deleteUser(u: UserResponse) {
    const name = `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email;
    if (!confirm(`Delete user: ${name} ?`)) return;

    this.api.delete(u.idUser).subscribe({
      next: () => this.loadUsers(),
      error: (e) => alert(e?.error?.message ?? 'Delete failed')
    });
  }
}