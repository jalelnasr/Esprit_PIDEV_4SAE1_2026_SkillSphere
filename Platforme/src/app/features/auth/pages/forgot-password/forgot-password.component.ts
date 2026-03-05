import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '@core/services';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  loading = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastService,
    private router: Router,
    private location: Location
  ) {
    // ✅ create form AFTER fb exists
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.toast.error('Please enter a valid email');
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.get('email')?.value;
    if (!email) return;

    this.loading = true;

    this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('If this email exists, a reset link has been sent.');
        this.router.navigateByUrl('/auth/login');
      },
      error: (e) => {
        this.loading = false;
        this.toast.error(e?.error?.message ?? 'Failed to send reset email');
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  get emailError(): string {
    const f = this.form.get('email');
    if (!f || !f.touched) return '';
    if (f.hasError('required')) return 'Email is required';
    if (f.hasError('email')) return 'Please enter a valid email';
    return '';
  }
}