import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '@core/services';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  loading = false;
  token = '';
  form: FormGroup;

  showNew = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    // ✅ read token
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    // ✅ create form AFTER fb exists
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]]
    });
  }

  submit(): void {
    if (!this.token) {
      this.toast.error('Reset token is missing');
      return;
    }

    if (this.form.invalid) {
      this.toast.error('Please fill all fields correctly');
      this.form.markAllAsTouched();
      return;
    }

    const newPassword = this.form.get('newPassword')?.value;
    const confirm = this.form.get('confirm')?.value;

    if (newPassword !== confirm) {
      this.toast.error('Passwords do not match');
      return;
    }

    this.loading = true;

    this.http.post(`${environment.apiUrl}/auth/reset-password`, { token: this.token, newPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Password reset successfully');
        this.router.navigateByUrl('/auth/login');
      },
      error: (e) => {
        this.loading = false;
        this.toast.error(e?.error?.message ?? 'Failed to reset password');
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}