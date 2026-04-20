export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  priceMonthly: number;
  currency: string;
  monthlyEnrollmentLimit: number | null;
  accessLevel: 'BASIC' | 'PLUS' | 'PREMIUM';
  features: string;
  isActive: boolean;
}

export interface UserSubscription {
  id: number;
  userId: number;
  plan: SubscriptionPlan;
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface SubscriptionPayment {
  id: number;
  subscriptionId: number;
  userId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId: string;
  paidAt: string | null;
  createdAt: string;
  planName?: string;
  userEmail?: string;
  // New fields for automatic payment system
  customerEmail?: string;
  maskedCard?: string;
  cardBrand?: string;
  otpSentAt?: string;
}

export interface AccessDeniedError {
  code: 'PLAN_REQUIRED' | 'UPGRADE_REQUIRED' | 'MONTHLY_LIMIT_REACHED';
  message: string;
  status: number;
  requiredPlan?: string;
  currentCount?: number;
  limit?: number;
}
