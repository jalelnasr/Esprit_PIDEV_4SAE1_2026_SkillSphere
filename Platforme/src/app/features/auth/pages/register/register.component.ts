import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ToastService } from '@core/services';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  roleOptions = [
    { value: 'learner', label: 'Learner', icon: '👨‍🎓' },
    { value: 'instructor', label: 'Instructor', icon: '👨‍🏫' },
    { value: 'enterprise', label: 'Enterprise', icon: '🏢' },
    { value: 'admin', label: 'Admin', icon: '🛡️' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['learner', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const { password, confirmPassword, firstName, lastName, email, role } = this.registerForm.value;
      if (password !== confirmPassword) {
        this.toastService.error('Passwords do not match');
        return;
      }

      this.isLoading = true;
      this.authService.registerWithRole(firstName, lastName, email, role, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.success('Account created successfully!');
          this.router.navigate([role === 'admin' ? '/admin/dashboard' : '/dashboard']);
        },
        error: () => {
          this.isLoading = false;
          this.toastService.error('Registration failed. Please try again.');
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
