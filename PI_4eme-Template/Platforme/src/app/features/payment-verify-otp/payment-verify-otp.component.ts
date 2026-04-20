import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService } from '@core/services/subscription.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-payment-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-verify-otp.component.html',
  styleUrls: ['./payment-verify-otp.component.css']
})
export class PaymentVerifyOtpComponent implements OnInit {
  paymentId: number = 0;
  email: string = '';
  otpCode: string = '';
  verifying = false;
  resending = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const paymentIdParam = this.route.snapshot.queryParamMap.get('paymentId');
    const emailParam = this.route.snapshot.queryParamMap.get('email');

    if (!paymentIdParam || !emailParam) {
      this.toastService.error('Paramètres manquants');
      this.router.navigate(['/pricing']);
      return;
    }

    this.paymentId = parseInt(paymentIdParam);
    this.email = emailParam;

    console.log('📧 OTP verification page loaded');
    console.log('Payment ID:', this.paymentId);
    console.log('Email:', this.email);
  }

  onOtpInput(event: any): void {
    // Only allow digits
    this.otpCode = event.target.value.replace(/\D/g, '').substring(0, 6);
  }

  verifyOtp(): void {
    if (!this.otpCode || this.otpCode.length !== 6) {
      this.toastService.error('Veuillez entrer un code à 6 chiffres');
      return;
    }

    this.verifying = true;

    console.log('🔐 Verifying OTP...');
    console.log('Payment ID:', this.paymentId);
    console.log('Email:', this.email);
    console.log('Code:', this.otpCode);

    this.subscriptionService.verifyOtp({
      paymentId: this.paymentId,
      email: this.email,
      otpCode: this.otpCode
    }).subscribe({
      next: (response) => {
        this.verifying = false;
        console.log('✅ OTP verified successfully!');
        console.log('🎉 Subscription activated!');
        
        this.toastService.success('Abonnement activé avec succès!');
        
        // Redirect to dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        this.verifying = false;
        console.error('❌ OTP verification failed:', err);
        
        if (err.error?.code === 'INVALID_OTP') {
          this.toastService.error('Code invalide ou expiré');
        } else if (err.error?.code === 'PAYMENT_NOT_FOUND') {
          this.toastService.error('Paiement introuvable');
        } else if (err.error?.code === 'EMAIL_MISMATCH') {
          this.toastService.error('Email ne correspond pas');
        } else {
          this.toastService.error('Erreur lors de la vérification');
        }
      }
    });
  }

  resendOtp(): void {
    this.resending = true;

    console.log('🔄 Resending OTP...');

    this.subscriptionService.resendOtp(this.paymentId).subscribe({
      next: (response) => {
        this.resending = false;
        console.log('✅ OTP resent to:', response.email);
        this.toastService.success('Code renvoyé! Vérifiez votre email.');
      },
      error: (err) => {
        this.resending = false;
        console.error('❌ Failed to resend OTP:', err);
        this.toastService.error('Erreur lors du renvoi du code');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pricing']);
  }
}
