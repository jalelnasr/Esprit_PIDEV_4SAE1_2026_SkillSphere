import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '@core/services/subscription.service';
import { ToastService } from '@core/services/toast.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { SubscriptionPayment } from '@shared/models';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent, FormsModule],
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.css']
})
export class AdminPaymentsComponent implements OnInit {
  payments: SubscriptionPayment[] = [];
  filteredPayments: SubscriptionPayment[] = [];
  loading = true;
  showConfirmDialog = false;
  showRejectDialog = false;
  selectedPayment: SubscriptionPayment | null = null;
  processing = false;
  
  // Filter options
  filterStatus: string = 'ALL'; // ALL, PENDING, COMPLETED, FAILED
  searchTerm: string = '';

  constructor(
    private subscriptionService: SubscriptionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAllPayments();
  }

  loadAllPayments(): void {
    this.loading = true;
    this.subscriptionService.getAllPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.toastService.error('Erreur lors du chargement des paiements');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.payments];
    
    // Filter by status
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(p => p.paymentStatus === this.filterStatus);
    }
    
    // Filter by search term (transaction ID, email, plan name)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.transactionId?.toLowerCase().includes(term) ||
        p.planName?.toLowerCase().includes(term) ||
        (p as any).customerEmail?.toLowerCase().includes(term)
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    this.filteredPayments = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'PENDING': return 'badge-warning';
      case 'FAILED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Complété';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      default: return status;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openConfirmDialog(payment: SubscriptionPayment): void {
    this.selectedPayment = payment;
    this.showConfirmDialog = true;
  }

  openRejectDialog(payment: SubscriptionPayment): void {
    this.selectedPayment = payment;
    this.showRejectDialog = true;
  }

  closeDialogs(): void {
    this.showConfirmDialog = false;
    this.showRejectDialog = false;
    this.selectedPayment = null;
  }

  confirmPayment(): void {
    if (!this.selectedPayment || this.processing) return;

    this.processing = true;
    this.subscriptionService.confirmPayment(this.selectedPayment.id).subscribe({
      next: () => {
        this.toastService.success('Paiement confirmé avec succès');
        this.processing = false;
        this.closeDialogs();
        this.loadAllPayments();
      },
      error: (err) => {
        console.error('Error confirming payment:', err);
        this.toastService.error('Erreur lors de la confirmation');
        this.processing = false;
        this.closeDialogs();
      }
    });
  }

  rejectPayment(): void {
    if (!this.selectedPayment || this.processing) return;

    this.processing = true;
    this.subscriptionService.rejectPayment(this.selectedPayment.id).subscribe({
      next: () => {
        this.toastService.success('Paiement rejeté');
        this.processing = false;
        this.closeDialogs();
        this.loadAllPayments();
      },
      error: (err) => {
        console.error('Error rejecting payment:', err);
        this.toastService.error('Erreur lors du rejet');
        this.processing = false;
        this.closeDialogs();
      }
    });
  }
}
