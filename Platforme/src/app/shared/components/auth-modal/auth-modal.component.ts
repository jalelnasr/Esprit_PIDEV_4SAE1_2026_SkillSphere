import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

interface ModuleInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {
  @Input() mode: 'login' | 'register' = 'login';
  @Output() closeModal = new EventEmitter<void>();
  
  isDarkMode = false;
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  showModules = false;
  userRole: 'learner' | 'instructor' | 'enterprise' | 'admin' | null = null;

  modules: ModuleInfo[] = [
    {
      id: 'learning',
      title: 'Learning Hub',
      description: 'Access courses and training materials',
      icon: '📚',
      route: '/learning/browse',
      roles: ['learner', 'instructor']
    },
    {
      id: 'certifications',
      title: 'Certifications',
      description: 'Earn recognized certificates',
      icon: '🏆',
      route: '/certification/exams',
      roles: ['learner', 'instructor']
    },
    {
      id: 'community',
      title: 'Community',
      description: 'Connect with other learners',
      icon: '👥',
      route: '/community/feed',
      roles: ['learner', 'instructor']
    },
    {
      id: 'gamification',
      title: 'Leaderboard',
      description: 'Compete and earn badges',
      icon: '🏅',
      route: '/gamification/leaderboard',
      roles: ['learner', 'instructor']
    },
    {
      id: 'corporate',
      title: 'Corporate Dashboard',
      description: 'Manage team training programs',
      icon: '🏢',
      route: '/corporate/dashboard',
      roles: ['enterprise']
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Join webinars and live sessions',
      icon: '📅',
      route: '/events/browse',
      roles: ['learner', 'instructor', 'enterprise']
    }
  ];

  roleOptions = [
    { value: 'learner', label: 'Learner', icon: '👨‍🎓' },
    { value: 'instructor', label: 'Instructor', icon: '👨‍🏫' },
    { value: 'enterprise', label: 'Enterprise', icon: '🏢' },
    { value: 'admin', label: 'Admin', icon: '🛡️' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    this.initializeForms();
  }

  initializeForms() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['learner', Validators.required],
      rememberMe: [false]
    });

    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['learner', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      const role = this.loginForm.get('role')?.value as 'learner' | 'instructor' | 'enterprise' | 'admin';
      
      this.authService.loginWithRole(email, password, role).subscribe({
        next: (user) => {
          this.isLoading = false;
          if (role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
            this.closeModal.emit();
            return;
          }

          this.showModules = true;
          this.userRole = role;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const formValue = this.registerForm.value;

      if (formValue.password !== formValue.confirmPassword) {
        this.isLoading = false;
        return;
      }
      
      this.authService.registerWithRole(
        formValue.firstName,
        formValue.lastName,
        formValue.email,
        formValue.role,
        formValue.password
      ).subscribe({
        next: (user) => {
          this.isLoading = false;
          if (formValue.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
            this.closeModal.emit();
            return;
          }

          this.showModules = true;
          this.userRole = formValue.role;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  getAvailableModules() {
    return this.modules.filter(m => m.roles.includes(this.userRole ?? ''));
  }

  navigateToModule(route: string) {
    this.router.navigate([route]);
    this.closeModal.emit();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  switchMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
  }

  getFieldError(fieldName: string): string {
    const form = this.mode === 'login' ? this.loginForm : this.registerForm;
    const field = form.get(fieldName);
    
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('email')) return 'Please enter a valid email';
    if (field?.hasError('minLength')) {
      const minLength = field.getError('minLength').requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    return '';
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
    this.closeModal.emit();
  }

  backToAuth() {
    this.showModules = false;
  }

  close() {
    this.closeModal.emit();
  }
}
