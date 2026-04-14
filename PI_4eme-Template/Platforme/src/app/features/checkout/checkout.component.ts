import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService } from '@core/services/subscription.service';
import { ToastService } from '@core/services/toast.service';
import { SubscriptionPlan } from '@shared/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  plan: SubscriptionPlan | null = null;
  loading = true;
  requesting = false;

  paymentData = {
    email: '',
    cardNumber: '',
    cardHolderName: '',
    cardExpiry: '',
    cardCvv: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const planSlug = this.route.snapshot.queryParamMap.get('plan');
    if (!planSlug) {
      this.router.navigate(['/pricing']);
      return;
    }
    this.loadPlan(planSlug);
    this.loadUserEmail();
  }

  loadPlan(slug: string): void {
    this.subscriptionService.getPlanBySlug(slug).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading plan:', err);
        this.toastService.error('Plan introuvable');
        this.router.navigate(['/pricing']);
      }
    });
  }

  loadUserEmail(): void {
    // Guard against SSR (Server-Side Rendering) where localStorage doesn't exist
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.email) {
          this.paymentData.email = user.email;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }

  getFeatures(): string[] {
    if (!this.plan) return [];
    return this.subscriptionService.parseFeaturesArray(this.plan.features);
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.paymentData.cardNumber = formattedValue;
  }

  formatExpiry(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentData.cardExpiry = value;
  }

  formatCvv(event: any): void {
    this.paymentData.cardCvv = event.target.value.replace(/\D/g, '');
  }

  submitPayment(): void {
    if (!this.plan || this.requesting) return;

    // Validate email
    if (!this.paymentData.email || !this.paymentData.email.includes('@')) {
      this.toastService.error('Email invalide');
      return;
    }

    // Validate card number (basic check)
    const cardDigits = this.paymentData.cardNumber.replace(/\s/g, '');
    if (cardDigits.length < 13 || cardDigits.length > 19) {
      this.toastService.error('Numéro de carte invalide');
      return;
    }

    // Validate expiry
    if (!this.paymentData.cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      this.toastService.error('Date d\'expiration invalide (MM/YY)');
      return;
    }

    // Validate CVV
    if (this.paymentData.cardCvv.length < 3 || this.paymentData.cardCvv.length > 4) {
      this.toastService.error('CVV invalide');
      return;
    }

    this.requesting = true;

    console.log('💳 Starting payment process...');
    console.log('Plan:', this.plan.slug);
    console.log('Email:', this.paymentData.email);
    console.log('Card:', this.paymentData.cardNumber.substring(this.paymentData.cardNumber.length - 4));

    // Call backend to start payment and send OTP
    this.subscriptionService.startDemoPayment({
      planSlug: this.plan.slug,
      email: this.paymentData.email,
      cardNumber: this.paymentData.cardNumber,
      cardExpiry: this.paymentData.cardExpiry,
      cardCvv: this.paymentData.cardCvv,
      cardHolderName: this.paymentData.cardHolderName
    }).subscribe({
      next: (response) => {
        this.requesting = false;
        console.log('✅ Payment started, OTP sent to:', response.email);
        
        this.toastService.success('Code de vérification envoyé à votre email!');
        
        // Navigate to OTP verification page
        this.router.navigate(['/payment/verify-otp'], {
          queryParams: {
            paymentId: response.paymentId,
            email: response.email
          }
        });
      },
      error: (err) => {
        this.requesting = false;
        console.error('Error starting payment:', err);
        
        if (err.error?.code === 'SUBSCRIPTION_EXISTS') {
          this.toastService.error('Vous avez déjà un abonnement actif');
        } else if (err.error?.code === 'PENDING_SUBSCRIPTION') {
          this.toastService.error('Vous avez déjà une demande en attente');
        } else if (err.error?.code === 'INVALID_EMAIL') {
          this.toastService.error('Email invalide');
        } else if (err.error?.code === 'INVALID_CARD') {
          this.toastService.error('Numéro de carte invalide');
        } else {
          this.toastService.error('Erreur lors du traitement du paiement');
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pricing']);
  }
}
