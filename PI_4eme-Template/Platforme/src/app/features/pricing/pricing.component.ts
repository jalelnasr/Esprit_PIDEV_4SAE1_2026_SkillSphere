import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService } from '@core/services/subscription.service';
import { SubscriptionPlan } from '@shared/models';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  loading = true;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.subscriptionService.getActivePlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading plans:', err);
        this.loading = false;
      }
    });
  }

  getFeatures(plan: SubscriptionPlan): string[] {
    return this.subscriptionService.parseFeaturesArray(plan.features);
  }

  selectPlan(planSlug: string): void {
    this.router.navigate(['/checkout'], { queryParams: { plan: planSlug } });
  }

  isRecommended(plan: SubscriptionPlan): boolean {
    return plan.slug === 'plus';
  }

  getLimitText(limit: number | null): string {
    return limit === null ? 'Illimité' : `${limit} par mois`;
  }
}
