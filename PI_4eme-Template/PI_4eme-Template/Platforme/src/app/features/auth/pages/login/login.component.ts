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
      rememberMe: [false]
    });
  }

  onLogin(): void {
    if (!this.loginForm.valid) return;

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.success('Login successful!');

        // ✅ redirect by BACKEND role & companyId
        if (res.role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
        else if (res.role === 'RH_ENTREPRISE' || res.role === 'MANAGER' || res.companyId) this.router.navigate(['/corporate-home']);
        else if (res.role === 'FORMATEUR') this.router.navigate(['/dashboard']);
        else this.router.navigate(['/dashboard']); // learner (APPRENANT) sans entreprise
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Login failed. Please try again.');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('email')) return 'Please enter a valid email';

    // ✅ Angular uses 'minlength'
    if (field?.hasError('minlength')) {
      const minLength = field.getError('minlength')?.requiredLength ?? 0;
      return `Minimum ${minLength} characters required`;
    }

    return '';
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}