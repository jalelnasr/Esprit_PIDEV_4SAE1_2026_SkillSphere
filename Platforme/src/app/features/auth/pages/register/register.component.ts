import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  userRole: string = 'STUDENT';

  roleOptions = [
    { value: 'STUDENT', label: 'Student', icon: '👨‍🎓' },
    { value: 'INSTRUCTOR', label: 'Instructor', icon: '👨‍🏫' },
    { value: 'CORPORATE_HR', label: 'Corporate HR', icon: '👔' }
  ];

  constructor(private fb: FormBuilder, private router: Router, private location: Location) {}

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
      role: ['STUDENT', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      // TODO: Call registration service
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/auth/login']);
      }, 1000);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goBack(): void {
    this.location.back();
  }
}
