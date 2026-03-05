import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService } from '@core/services/subscription.service';
import { ToastService } from '@core/services/toast.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { UserSubscription, SubscriptionPayment } from '@shared/models';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './subscription-management.component.html',
  styleUrls: ['./subscription-management.component.css']
})
export class SubscriptionManagementComponent implements OnInit {
  subscription: UserSubscription | null = null;
  payments: SubscriptionPayment[] = [];
  loading = true;
  showCancelDialog = false;
  monthlyUsage = 0;

  constructor(
    private subscriptionService: SubscriptionService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubscription();
    this.loadPaymentHistory();
  }

  loadSubscription(): void {
    this.subscriptionService.getMySubscription().subscribe({
      next: (subscription) => {
        this.subscription = subscription;
        this.loading = false;
        // TODO: Load monthly usage from enrollment count
        this.monthlyUsage = 0;
      },
      error: (err) => {
        console.error('Error loading subscription:', err);
        this.loading = false;
      }
    });
  }

  loadPaymentHistory(): void {
    this.subscriptionService.getMyPaymentHistory().subscribe({
      next: (payments) => {
        this.payments = payments;
      },
      error: (err) => {
        console.error('Error loading payment history:', err);
      }
    });
  }

  getFeatures(): string[] {
    if (!this.subscription?.plan) return [];
    return this.subscriptionService.parseFeaturesArray(this.subscription.plan.features);
  }

  getStatusBadgeClass(): string {
    if (!this.subscription) return '';
    switch (this.subscription.status) {
      case 'ACTIVE': return 'status-active';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      case 'EXPIRED': return 'status-expired';
      default: return '';
    }
  }

  getStatusText(): string {
    if (!this.subscription) return '';
    switch (this.subscription.status) {
      case 'ACTIVE': return 'Actif';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulé';
      case 'EXPIRED': return 'Expiré';
      default: return this.subscription.status;
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'payment-completed';
      case 'PENDING': return 'payment-pending';
      case 'FAILED': return 'payment-failed';
      case 'REFUNDED': return 'payment-refunded';
      default: return '';
    }
  }

  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Complété';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      case 'REFUNDED': return 'Remboursé';
      default: return status;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getDaysRemaining(): number {
    if (!this.subscription?.endDate) return 0;
    const end = new Date(this.subscription.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getUsagePercentage(): number {
    if (!this.subscription?.plan.monthlyEnrollmentLimit) return 0;
    return (this.monthlyUsage / this.subscription.plan.monthlyEnrollmentLimit) * 100;
  }

  canUpgrade(): boolean {
    return this.subscription?.status === 'ACTIVE' && 
           this.subscription?.plan.slug !== 'premium';
  }

  canCancel(): boolean {
    return this.subscription?.status === 'ACTIVE';
  }

  goToPricing(): void {
    this.router.navigate(['/pricing']);
  }

  openCancelDialog(): void {
    console.log('🔔 Opening cancel dialog...');
    this.showCancelDialog = true;
  }

  closeCancelDialog(): void {
    this.showCancelDialog = false;
  }

  confirmCancel(): void {
    console.log('🚫 Cancelling subscription...');
    this.subscriptionService.cancelSubscription().subscribe({
      next: () => {
        console.log('✅ Subscription cancelled successfully');
        this.toastService.success('Abonnement annulé avec succès');
        this.showCancelDialog = false;
        this.loadSubscription();
      },
      error: (err) => {
        console.error('❌ Error cancelling subscription:', err);
        this.toastService.error('Erreur lors de l\'annulation');
        this.showCancelDialog = false;
      }
    });
  }
}
