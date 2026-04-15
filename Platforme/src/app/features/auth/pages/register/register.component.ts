import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ToastService } from '@core/services';
import { RegisterRequest } from '@core/models/auth.model';

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
  serverError: string | null = null;
  debugMode = false; // Toggle debug info display
  requestDetails: any = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    // Enable debug mode if query parameter is set
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      this.debugMode = urlParams.has('debug');
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    console.log('🔍 RegisterComponent initialized, debug mode:', this.debugMode);
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  onRegister(): void {
    if (!this.registerForm.valid) {
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    const { password, confirmPassword, firstName, lastName, email } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    this.isLoading = true;
    this.serverError = null;

    // Prepare request payload
    const registerRequest = {
      prenom: firstName,
      nom: lastName,
      email,
      password
    } as RegisterRequest;

    // Store request details for debugging
    this.requestDetails = {
      timestamp: new Date().toISOString(),
      endpoint: '/api/auth/register',
      method: 'POST',
      payload: {
        prenom: firstName,
        nom: lastName,
        email: email,
        password: '[REDACTED]'
      },
      expectedHeaders: {
        'Content-Type': 'application/json',
        'Authorization': 'None (public endpoint)'
      }
    };

    console.log('📝 Registration Request Details:', this.requestDetails);
    console.log('📤 Sending to:', `${this.getApiUrl()}/api/auth/register`);

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Registration successful:', {
          user: response.nom + ' ' + response.prenom,
          email: response.email,
          role: response.role,
          hasToken: !!response.token
        });
        
        this.toastService.success('Account created successfully!');
        // Navigate to dashboard after short delay to show success message
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Registration failed:', error);
        
        // Parse error message from various sources
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.error?.error) {
          errorMessage = error.error.error;
        } else if (error?.status === 0) {
          errorMessage = 'Cannot connect to server. Is the backend running at http://localhost:8085?';
        } else if (error?.status === 400) {
          errorMessage = 'Invalid registration data. Please check your inputs.';
        } else if (error?.status === 409) {
          errorMessage = 'Email already registered. Please login or use a different email.';
        } else if (error?.status === 500) {
          errorMessage = 'Server error. Please contact support.';
        }
        
        this.serverError = errorMessage;
        this.toastService.error(errorMessage);
        
        // Log detailed error for debugging
        console.error('📋 Error Details:', {
          status: error?.status,
          message: error?.message,
          fullError: error
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.hasError('required')) return 'This field is required';
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength')?.requiredLength ?? 0;
      return `Minimum ${minLength} characters required`;
    }
    if (field.hasError('email')) return 'Please enter a valid email address';

    return '';
  }

  /**
   * Get the current API URL from the environment
   */
  private getApiUrl(): string {
    // Try to detect from window if available
    if (typeof window !== 'undefined' && (window as any).environment?.apiUrl) {
      return (window as any).environment.apiUrl;
    }
    return 'http://localhost:8085';
  }

  /**
   * Copy request details to clipboard for manual testing
   */
  copyRequestDetails(): void {
    if (!this.requestDetails) return;
    
    const detailsText = JSON.stringify(this.requestDetails, null, 2);
    navigator.clipboard.writeText(detailsText).then(() => {
      this.toastService.success('Request details copied to clipboard');
    });
  }

  /**
   * Toggle debug mode on/off
   */
  toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
    console.log('🔍 Debug mode toggled:', this.debugMode);
  }
}