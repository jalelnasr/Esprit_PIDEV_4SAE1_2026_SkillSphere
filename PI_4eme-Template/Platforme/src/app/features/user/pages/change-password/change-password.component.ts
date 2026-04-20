import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '@core/services';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  loading = false;

  showOld = false;
  showNew = false;
  showConfirm = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.toast.error('Please fill all fields correctly');
      return;
    }

    const { oldPassword, newPassword, confirm } = this.form.getRawValue();

    if (newPassword !== confirm) {
      this.toast.error('Passwords do not match');
      return;
    }

    this.loading = true;

    this.http
      .put(`${environment.apiUrl}/users/me/password`, { oldPassword, newPassword })
      .subscribe({
        next: () => {
          this.loading = false;
          this.toast.success('Password changed successfully');
          this.router.navigateByUrl('/dashboard');
        },
        error: (e) => {
          this.loading = false;
          this.toast.error(e?.error?.message ?? 'Failed to change password');
        }
      });
  }
}