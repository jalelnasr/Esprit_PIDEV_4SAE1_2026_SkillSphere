import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ToastService } from '@core/services';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  isDarkMode = false;

  roleOptions = [
    { value: 'learner', label: 'Learner', icon: '👨‍🎓' },
    { value: 'instructor', label: 'Instructor', icon: '👨‍🏫' },
    { value: 'enterprise', label: 'Enterprise', icon: '🏢' },
    { value: 'admin', label: 'Admin', icon: '🛡️' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private location: Location,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    this.initializeForm();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['learner', Validators.required],
      rememberMe: [false]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password, role } = this.loginForm.value;
      
      this.authService.loginWithRole(email, password, role).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.success('Login successful!');
          this.router.navigate([role === 'admin' ? '/admin/dashboard' : '/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.error('Login failed. Please try again.');
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('email')) return 'Please enter a valid email';
    if (field?.hasError('minLength')) {
      const minLength = field.getError('minLength').requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
