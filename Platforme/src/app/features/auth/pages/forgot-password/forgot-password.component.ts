import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Reset Password</h1>
        <p>Enter your email to receive reset instructions</p>
        <input type="email" placeholder="your@email.com" class="form-input" />
        <button class="submit-btn">Send Reset Link</button>
        <a href="/auth/login" class="back-link">Back to Login</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .auth-card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      max-width: 400px;
      text-align: center;
    }
    h1 { margin: 0 0 0.5rem 0; color: #333; }
    p { margin: 0 0 2rem 0; color: #999; }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 14px;
    }
    .submit-btn {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .back-link {
      display: block;
      color: #667eea;
      text-decoration: none;
      font-size: 13px;
    }
  `]
})
export class ForgotPasswordComponent {}
