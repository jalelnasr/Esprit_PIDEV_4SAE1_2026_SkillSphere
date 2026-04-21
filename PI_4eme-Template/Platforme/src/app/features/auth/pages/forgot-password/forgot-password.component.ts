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
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      this.toast.error('Veuillez entrer un email valide');
      return;
    }

    const email = this.form.get('email')?.value;
    if (!email) return;

    this.loading = true;

    this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Si cet email existe, un lien de réinitialisation a été envoyé.');
        this.router.navigateByUrl('/auth/login');
      },
      error: (e) => {
        this.loading = false;
        this.toast.error(e?.error?.message ?? 'Échec de l\'envoi de l\'email');
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  get emailError(): string {
    const f = this.form.get('email');
    if (!f || !f.touched) return '';
    if (f.hasError('required')) return 'Ce champ est obligatoire';
    if (f.hasError('email')) return 'Email invalide';
    return '';
  }
}