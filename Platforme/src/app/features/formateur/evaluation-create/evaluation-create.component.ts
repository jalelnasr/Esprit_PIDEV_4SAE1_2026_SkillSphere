import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators, ReactiveFormsModule, FormGroup} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EvaluationApiService } from '../../../services/evaluation-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-evaluation-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './evaluation-create.component.html',
  styleUrls: ['./evaluation-create.component.css']
})
export class EvaluationCreateComponent implements OnInit {

  form!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private evaluationService: EvaluationApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('✅ EvaluationCreateComponent initialized');
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: ['']
    });
  }

  submit() {
    console.log('📝 Submit clicked');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);

    if (this.form.invalid) {
      console.error('❌ Form is invalid');
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        console.log('✅ User loaded:', user?.idUser, user?.nom, user?.prenom);
        
        if (!user) {
          console.error('❌ No user found');
          this.errorMessage = 'User not authenticated. Please login again.';
          this.isSubmitting = false;
          return;
        }

        const formateurId = user.idUser;
        console.log('📤 Creating evaluation with formateurId:', formateurId);

        this.evaluationService.create({
          title: this.form.value.title,
          description: this.form.value.description,
          formateurId
        }).subscribe({
          next: (created) => {
            console.log('✅ Evaluation created successfully:', created.id);
            this.successMessage = 'Evaluation created! Redirecting...';
            this.isSubmitting = false;
            
            // ✅ Redirect after create -> manage page
            setTimeout(() => {
              this.router.navigate(['/formateur/evaluations', created.id, 'manage']);
            }, 500);
          },
          error: (err) => {
            console.error('❌ Error creating evaluation:', err);
            this.errorMessage = 'Failed to create evaluation: ' + (err?.message || err?.error?.message || 'Unknown error');
            this.isSubmitting = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error getting current user:', err);
        this.errorMessage = 'Authentication error: ' + (err?.message || 'Unknown error');
        this.isSubmitting = false;
      }
    });
  }
}

