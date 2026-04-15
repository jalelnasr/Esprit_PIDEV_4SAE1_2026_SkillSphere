import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from 'src/app/services/theme.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UiRole } from '../../models/auth.model';
import { AuthResponse, RegisterRequest } from 'src/app/core/models/auth.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


interface ModuleInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  roles: UiRole[];
}

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {
  // ✅ add forgot mode
  @Input() mode: 'login' | 'register' | 'forgot' = 'login';
  @Output() closeModal = new EventEmitter<void>();

  isDarkMode = false;
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  // ✅ new
  forgotForm!: FormGroup;
  loadingForgot = false;

  showPassword = false;
  isLoading = false;
  showModules = false;

  // UI role derived ONLY from backend role after auth
  userRole: UiRole | null = null;

  errorMessage: string | null = null;

  modules: ModuleInfo[] = [
    { id: 'learning', title: 'Learning Hub', description: 'Access courses and training materials', icon: '📚', route: '/learning/browse', roles: ['learner', 'instructor'] },
    { id: 'certifications', title: 'Certifications', description: 'Earn recognized certificates', icon: '🏆', route: '/certification/exams', roles: ['learner', 'instructor'] },
    { id: 'community', title: 'Community', description: 'Connect with other learners', icon: '👥', route: '/community/feed', roles: ['learner', 'instructor'] },
    { id: 'gamification', title: 'Leaderboard', description: 'Compete and earn badges', icon: '🏅', route: '/gamification/leaderboard', roles: ['learner', 'instructor'] },
    { id: 'corporate', title: 'Corporate Dashboard', description: 'Manage team training programs', icon: '🏢', route: '/corporate/dashboard', roles: ['enterprise'] },
    { id: 'events', title: 'Events', description: 'Join webinars and live sessions', icon: '📅', route: '/events/browse', roles: ['learner', 'instructor', 'enterprise'] }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe(isDark => (this.isDarkMode = isDark));
    this.initializeForms();
  }

  private initializeForms() {
    // ✅ login: no role selection
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // ✅ register: learner only (no role selection)
    this.registerForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });

    // ✅ forgot-password form
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // =========================
  // AUTH FLOW
  // =========================
  onLogin() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value as { email: string; password: string };

    this.authService.login(email, password).subscribe({
      next: (_res: AuthResponse) => {
        this.isLoading = false;

        const backendRole = this.authService.getUserRole();
        const finalRole: UiRole = this.mapBackendRoleToUiRole(backendRole) ?? 'learner';

        if (finalRole === 'admin') {
          this.router.navigate(['/admin/dashboard']);
          this.closeModal.emit();
          return;
        }

        this.userRole = finalRole;
        this.showModules = true;
      },
      error: (err: unknown) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isLoading = true;

    const v = this.registerForm.value as {
      prenom: string;
      nom: string;
      email: string;
      password: string;
      confirmPassword: string;
    };

    this.errorMessage = null;

    if (v.password !== v.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.isLoading = false;
      return;
    }

    // ✅ Register always creates learner (backend enforces role)
    const payload = {
      prenom: v.prenom,
      nom: v.nom,
      email: v.email,
      password: v.password
    } as RegisterRequest;

    console.log('📝 Register payload:', payload);

    this.authService.register(payload).subscribe({
      next: (_res: AuthResponse) => {
        this.isLoading = false;
        this.errorMessage = null;

        const backendRole = this.authService.getUserRole();
        const finalRole: UiRole = this.mapBackendRoleToUiRole(backendRole) ?? 'learner';

        if (finalRole === 'admin') {
          this.router.navigate(['/admin/dashboard']);
          this.closeModal.emit();
          return;
        }

        this.userRole = finalRole;
        this.showModules = true;
      },
      error: (err: any) => {
        console.error('❌ Register error in modal:', err);
        this.isLoading = false;
        if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err?.message) {
          this.errorMessage = err.message;
        } else if (err?.status === 0) {
          this.errorMessage = 'Cannot connect to server. Is the backend running?';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }

  // =========================
  // FORGOT PASSWORD (HOME MODAL)
  // =========================
  openForgot(): void {
    this.errorMessage = null;
    this.mode = 'forgot';

    // prefill email from login input if user already typed it
    const email = this.loginForm?.get('email')?.value ?? '';
    this.forgotForm.patchValue({ email });
  }

  backToLogin(): void {
    this.errorMessage = null;
    this.mode = 'login';
  }

  submitForgot(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.errorMessage = 'Please enter a valid email.';
      return;
    }

    const { email } = this.forgotForm.getRawValue();
    if (!email) return;

    this.loadingForgot = true;
    this.errorMessage = null;

    // ✅ BACKEND: POST /api/auth/forgot-password  { email }
    this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email }).subscribe({
      next: () => {
        this.loadingForgot = false;

        // ✅ security: same message even if email not found
        this.errorMessage = null;

        // Optional: showModules stays false, just go back to login
        this.mode = 'login';

        // You can also auto-close modal if you want:
        // this.closeModal.emit();
      },
      error: (err: any) => {
        console.error(err);
        this.loadingForgot = false;
        this.errorMessage = err?.error?.message ?? 'Failed to send reset email.';
      }
    });
  }

  // =========================
  // MODULES UI
  // =========================
  getAvailableModules(): ModuleInfo[] {
    const role = this.userRole;
    if (!role) return [];
    return this.modules.filter(m => m.roles.includes(role));
  }

  navigateToModule(route: string) {
    this.router.navigate([route]);
    this.closeModal.emit();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
    this.closeModal.emit();
  }

  backToAuth() {
    this.showModules = false;
    // keep current mode (login/register) as-is
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  switchMode() {
    // ✅ if you are in forgot, switchMode should go back to register/login normally
    if (this.mode === 'forgot') {
      this.mode = 'login';
      return;
    }
    this.mode = this.mode === 'login' ? 'register' : 'login';
  }

  close() {
    this.closeModal.emit();
  }

  getFieldError(fieldName: string): string {
    const form = this.mode === 'login' ? this.loginForm : this.registerForm;
    const field = form.get(fieldName);

    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('email')) return 'Please enter a valid email';
    if (field?.hasError('minlength'))
      return `Minimum ${field.getError('minlength').requiredLength} characters required`;
    return '';
  }

  private mapBackendRoleToUiRole(backendRole: string | null): UiRole | null {
    if (!backendRole) return null;

    if (backendRole === 'ADMIN') return 'admin';
    if (backendRole === 'FORMATEUR') return 'instructor';
    if (backendRole === 'RH_ENTREPRISE') return 'enterprise';
    if (backendRole === 'APPRENANT') return 'learner';

    return null;
  }

}
