import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubscriptionPlan, UserSubscription, SubscriptionPayment } from '@shared/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  // Use Gateway URL directly for Formation Service endpoints
  private apiUrl = 'http://localhost:8087/formation-service/api';

  constructor(private http: HttpClient) {}

  // Public endpoints
  getActivePlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.apiUrl}/subscription-plans`);
  }

  getPlanBySlug(slug: string): Observable<SubscriptionPlan> {
    return this.http.get<SubscriptionPlan>(`${this.apiUrl}/subscription-plans/slug/${slug}`);
  }

  // User endpoints (requires authentication)
  getMySubscription(): Observable<UserSubscription | null> {
    const userId = this.getUserId();
    const headers = new HttpHeaders().set('X-User-Id', userId.toString());
    return this.http.get<UserSubscription | null>(`${this.apiUrl}/subscriptions/me`, { headers });
  }

  requestSubscription(planSlug: string): Observable<UserSubscription> {
    const userId = this.getUserId();
    const headers = new HttpHeaders().set('X-User-Id', userId.toString());
    return this.http.post<UserSubscription>(
      `${this.apiUrl}/subscriptions/checkout?planSlug=${planSlug}`,
      {},
      { headers }
    );
  }

  // Demo payment with Email OTP
  startDemoPayment(paymentData: any): Observable<any> {
    const userId = this.getUserId();
    const headers = new HttpHeaders().set('X-User-Id', userId.toString());
    return this.http.post<any>(
      `${this.apiUrl}/payments/demo/start`,
      paymentData,
      { headers }
    );
  }

  verifyOtp(otpData: any): Observable<SubscriptionPayment> {
    // No X-User-Id header needed - OTP is the security mechanism
    return this.http.post<SubscriptionPayment>(
      `${this.apiUrl}/payments/demo/verify-otp`,
      otpData
    );
  }

  resendOtp(paymentId: number): Observable<any> {
    // No X-User-Id header needed - payment ID is sufficient
    return this.http.post<any>(
      `${this.apiUrl}/payments/demo/resend-otp?paymentId=${paymentId}`,
      {}
    );
  }

  // Legacy methods (kept for backward compatibility)
  simulatePaymentSuccess(paymentId: number): Observable<SubscriptionPayment> {
    const userId = this.getUserId();
    const headers = new HttpHeaders().set('X-User-Id', userId.toString());
    return this.http.post<SubscriptionPayment>(
      `${this.apiUrl}/payments/${paymentId}/simulate-success`,
      {},
      { headers }
    );
  }

  simulatePaymentFailure(paymentId: number): Observable<SubscriptionPayment> {
    const userId = this.getUserId();
    const headers = new HttpHeaders().set('X-User-Id', userId.toString());
    return this.http.post<SubscriptionPayment>(
      `${this.apiUrl}/payments/${paymentId}/simulate-failure`,
      {},
      { headers }
    );
  }

  cancelSubscription(): Observable<void> {
    const userId = this.getUserId();
    const headers = new HttpHeaders().set('X-User-Id', userId.toString());
    return this.http.post<void>(`${this.apiUrl}/subscriptions/cancel`, {}, { headers });
  }

  getMyPaymentHistory(): Observable<SubscriptionPayment[]> {
    const userId = this.getUserId();
    const headers = new HttpHeaders().set('X-User-Id', userId.toString());
    return this.http.get<SubscriptionPayment[]>(`${this.apiUrl}/payments/history`, { headers });
  }

  // Admin endpoints
  getPendingPayments(): Observable<SubscriptionPayment[]> {
    return this.http.get<SubscriptionPayment[]>(`${this.apiUrl}/payments/admin/pending`);
  }

  getAllPayments(): Observable<SubscriptionPayment[]> {
    return this.http.get<SubscriptionPayment[]>(`${this.apiUrl}/payments/admin/all`);
  }

  confirmPayment(paymentId: number): Observable<SubscriptionPayment> {
    return this.http.post<SubscriptionPayment>(`${this.apiUrl}/payments/admin/${paymentId}/confirm`, {});
  }

  rejectPayment(paymentId: number): Observable<SubscriptionPayment> {
    return this.http.post<SubscriptionPayment>(`${this.apiUrl}/payments/admin/${paymentId}/reject`, {});
  }

  // Helper methods
  private getUserId(): number {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.idUser || user.id || 0;
    }
    return 0;
  }

  parseFeaturesArray(features: string): string[] {
    try {
      return JSON.parse(features);
    } catch {
      return [];
    }
  }
}
