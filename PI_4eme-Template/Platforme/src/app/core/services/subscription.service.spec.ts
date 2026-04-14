import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:8087/formation-service/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubscriptionService]
    });
    service = TestBed.inject(SubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage for getUserId()
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ idUser: 100 }));
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── getActivePlans ────────────────────────────────────────────────────────

  it('should get all active subscription plans', () => {
    const mockPlans = [
      { id: 1, name: 'Basic', slug: 'basic', priceMonthly: 29.99, accessLevel: 'BASIC', monthlyEnrollmentLimit: 3, isActive: true },
      { id: 2, name: 'Plus', slug: 'plus', priceMonthly: 49.99, accessLevel: 'PLUS', monthlyEnrollmentLimit: 10, isActive: true },
      { id: 3, name: 'Premium', slug: 'premium', priceMonthly: 99.99, accessLevel: 'PREMIUM', monthlyEnrollmentLimit: null, isActive: true }
    ];

    service.getActivePlans().subscribe(plans => {
      expect(plans.length).toBe(3);
      expect(plans[0].name).toBe('Basic');
      expect(plans[2].monthlyEnrollmentLimit).toBeNull();
    });

    const req = httpMock.expectOne(`${base}/subscription-plans`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlans);
  });

  // ── getPlanBySlug ─────────────────────────────────────────────────────────

  it('should get plan by slug', () => {
    const mockPlan = { id: 2, name: 'Plus', slug: 'plus', priceMonthly: 49.99, accessLevel: 'PLUS' };

    service.getPlanBySlug('plus').subscribe(plan => {
      expect(plan.slug).toBe('plus');
      expect(plan.name).toBe('Plus');
    });

    const req = httpMock.expectOne(`${base}/subscription-plans/slug/plus`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlan);
  });

  // ── getMySubscription ─────────────────────────────────────────────────────

  it('should get current user active subscription', () => {
    const mockSubscription = {
      id: 1, userId: 100,
      plan: { id: 2, name: 'Plus', slug: 'plus', priceMonthly: 49.99, accessLevel: 'PLUS' },
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    service.getMySubscription().subscribe(subscription => {
      expect(subscription).not.toBeNull();
      if (subscription) {
        expect(subscription.status).toBe('ACTIVE' as any);
      }
    });

    const req = httpMock.expectOne(`${base}/subscriptions/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSubscription);
  });

  it('should return null when no active subscription', () => {
    service.getMySubscription().subscribe(subscription => {
      expect(subscription).toBeNull();
    });

    const req = httpMock.expectOne(`${base}/subscriptions/me`);
    req.flush(null);
  });

  // ── requestSubscription ───────────────────────────────────────────────────

  it('should request a subscription', () => {
    const mockSubscription = {
      id: 1, userId: 100,
      plan: { id: 2, name: 'Plus', slug: 'plus' },
      status: 'PENDING'
    };

    service.requestSubscription('plus').subscribe(subscription => {
      expect(subscription.status).toBe('PENDING' as any);
    });

    const req = httpMock.expectOne(`${base}/subscriptions/checkout?planSlug=plus`);
    expect(req.request.method).toBe('POST');
    req.flush(mockSubscription);
  });

  // ── cancelSubscription ────────────────────────────────────────────────────

  it('should cancel subscription', () => {
    service.cancelSubscription().subscribe(res => expect(res).toBeFalsy());

    const req = httpMock.expectOne(`${base}/subscriptions/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  // ── getMyPaymentHistory ───────────────────────────────────────────────────

  it('should get payment history', () => {
    const mockHistory = [
      { id: 1, userId: 100, amount: 49.99, paymentStatus: 'COMPLETED', paidAt: new Date().toISOString() },
      { id: 2, userId: 100, amount: 49.99, paymentStatus: 'FAILED', paidAt: null }
    ];

    service.getMyPaymentHistory().subscribe(payments => {
      expect(payments.length).toBe(2);
      expect(payments[0].paymentStatus).toBe('COMPLETED' as any);
    });

    const req = httpMock.expectOne(`${base}/payments/history`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });

  // ── Admin: getPendingPayments ─────────────────────────────────────────────

  it('should get pending payments (admin)', () => {
    const mockPending = [
      { id: 1, userId: 100, amount: 49.99, paymentStatus: 'PENDING' },
      { id: 2, userId: 101, amount: 99.99, paymentStatus: 'PENDING' }
    ];

    service.getPendingPayments().subscribe(payments => {
      expect(payments.length).toBe(2);
      expect(payments[0].paymentStatus).toBe('PENDING' as any);
    });

    const req = httpMock.expectOne(`${base}/payments/admin/pending`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPending);
  });

  // ── Admin: confirmPayment ─────────────────────────────────────────────────

  it('should confirm payment (admin)', () => {
    const confirmed = { id: 1, userId: 100, amount: 49.99, paymentStatus: 'COMPLETED' };

    service.confirmPayment(1).subscribe(payment => {
      expect(payment.paymentStatus).toBe('COMPLETED' as any);
    });

    const req = httpMock.expectOne(`${base}/payments/admin/1/confirm`);
    expect(req.request.method).toBe('POST');
    req.flush(confirmed);
  });

  // ── Admin: rejectPayment ──────────────────────────────────────────────────

  it('should reject payment (admin)', () => {
    const rejected = { id: 1, userId: 100, amount: 49.99, paymentStatus: 'FAILED' };

    service.rejectPayment(1).subscribe(payment => {
      expect(payment.paymentStatus).toBe('FAILED' as any);
    });

    const req = httpMock.expectOne(`${base}/payments/admin/1/reject`);
    expect(req.request.method).toBe('POST');
    req.flush(rejected);
  });

  // ── parseFeaturesArray ────────────────────────────────────────────────────

  it('should parse features JSON array', () => {
    const features = '["Feature 1", "Feature 2", "Feature 3"]';
    const result = service.parseFeaturesArray(features);
    expect(result).toEqual(['Feature 1', 'Feature 2', 'Feature 3']);
  });

  it('should return empty array for invalid JSON', () => {
    const result = service.parseFeaturesArray('invalid json');
    expect(result).toEqual([]);
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  it('should handle 400 when requesting duplicate subscription', () => {
    service.requestSubscription('plus').subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(400)
    });

    const req = httpMock.expectOne(`${base}/subscriptions/checkout?planSlug=plus`);
    req.flush('Already subscribed', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 404 when plan not found', () => {
    service.getPlanBySlug('nonexistent').subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(404)
    });

    const req = httpMock.expectOne(`${base}/subscription-plans/slug/nonexistent`);
    req.flush('Plan not found', { status: 404, statusText: 'Not Found' });
  });
});
