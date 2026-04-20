# Individual Subscription System - Requirements & Implementation Plan

## Overview
Implement a manual payment subscription system for individual learners (APPRENANT role) with three tiers offering different levels of course access. No free trial - users must have an ACTIVE subscription to enroll in ANY course.

---

## 1. SUBSCRIPTION PLANS (Tiers)

### Basic Plan
- **Price**: 25 DT/month (Tunisian Dinar)
- **Monthly Limit**: 5 enrollments per month
- **Course Access**: BASIC level courses only (Beginner difficulty)
- **Features**:
  - Access to beginner courses
  - Course progress tracking
  - Basic certificates
  - Downloadable course resources
  - Email support
  - Community forum access
- **Limitations**:
  - Cannot access Intermediate or Advanced courses
  - Limited to 5 enrollments per month
  - No live sessions

### Plus Plan
- **Price**: 45 DT/month
- **Monthly Limit**: 15 enrollments per month
- **Course Access**: BASIC + PLUS level courses (Beginner + Intermediate)
- **Features**:
  - All Basic features
  - Access to intermediate courses
  - Professional certificates
  - Live session access
  - Priority email support
  - Full community forum access
- **Limitations**:
  - Cannot access Advanced courses
  - Limited to 15 enrollments per month

### Premium Plan
- **Price**: 75 DT/month
- **Monthly Limit**: Unlimited enrollments
- **Course Access**: BASIC + PLUS + PREMIUM level courses (All difficulties)
- **Features**:
  - All Plus features
  - Access to advanced/expert courses
  - Unlimited course enrollments
  - Priority support
  - Learning path recommendations
  - Progress analytics
  - Early access to new courses

---

## 2. BUSINESS RULES

### 2.1 No Free Enrollments
- Users MUST have an ACTIVE subscription to enroll in ANY course
- No free trial period
- If user has no ACTIVE subscription → 403 error with code `PLAN_REQUIRED`

### 2.2 Course Access Levels
Courses have an `access_level` field that determines which plans can access them:

| Course Difficulty | Access Level | Plans That Can Access |
|------------------|--------------|----------------------|
| Beginner | BASIC | Basic, Plus, Premium |
| Intermediate | PLUS | Plus, Premium |
| Advanced | PREMIUM | Premium only |

**Access Control Logic:**
- Basic plan → can enroll in BASIC courses only
- Plus plan → can enroll in BASIC + PLUS courses
- Premium plan → can enroll in BASIC + PLUS + PREMIUM courses
- If course level is higher than user's plan → 403 error with code `UPGRADE_REQUIRED`

### 2.3 Monthly Enrollment Limits
- Limits are counted when the learner **enrolls** (not on completion)
- Count enrollments in the current month where `status != CANCELLED`
- Use existing `enrollments` table (no new `course_access_log` table needed)
- If count >= plan limit → 403 error with code `MONTHLY_LIMIT_REACHED`
- Premium plan has unlimited enrollments (NULL limit)

### 2.4 Subscription Statuses
- **PENDING**: Created but not yet validated/paid by admin
- **ACTIVE**: Paid and valid (current date between start_date and end_date)
- **CANCELLED**: Admin or user cancelled the subscription
- **EXPIRED**: end_date has passed

### 2.5 Payment Statuses
- **PENDING**: Payment request submitted, awaiting admin confirmation
- **COMPLETED**: Admin confirmed payment, subscription activated
- **FAILED**: Payment rejected by admin
- **REFUNDED**: Payment refunded by admin (optional)

### 2.6 Lazy Expiration
- No cron jobs needed
- When fetching subscription OR checking access during enrollment:
  - If subscription is ACTIVE but `end_date < now` → update status to EXPIRED
- This keeps the system consistent without scheduled jobs

---

## 3. DATABASE SCHEMA

### 3.1 New Tables (in formation_db)

#### `subscription_plans` table
```sql
CREATE TABLE subscription_plans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,           -- "Basic", "Plus", "Premium"
  slug VARCHAR(50) NOT NULL UNIQUE,    -- "basic", "plus", "premium"
  price_monthly DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DT',    -- Tunisian Dinar
  monthly_enrollment_limit INT,        -- NULL for unlimited (Premium)
  access_level ENUM('BASIC', 'PLUS', 'PREMIUM') NOT NULL,
  features JSON,                       -- List of features for display
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default plans
INSERT INTO subscription_plans (name, slug, price_monthly, monthly_enrollment_limit, access_level, features) VALUES
('Basic', 'basic', 25.00, 5, 'BASIC', '["Beginner courses", "Basic certificates", "Email support"]'),
('Plus', 'plus', 45.00, 15, 'PLUS', '["Beginner + Intermediate courses", "Professional certificates", "Live sessions", "Priority support"]'),
('Premium', 'premium', 75.00, NULL, 'PREMIUM', '["All courses", "Unlimited enrollments", "Priority support", "Analytics"]');
```

#### `user_subscriptions` table
```sql
CREATE TABLE user_subscriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  status ENUM('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING',
  start_date TIMESTAMP NULL,           -- Set when admin confirms payment
  end_date TIMESTAMP NULL,             -- start_date + 30 days
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP NULL,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_end_date (end_date)
);
```

#### `subscription_payments` table
```sql
CREATE TABLE subscription_payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  subscription_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DT',
  payment_method VARCHAR(50) DEFAULT 'MANUAL',  -- Always "MANUAL" for now
  payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  transaction_id VARCHAR(100),         -- Format: SKILLSPHERE-{userId}-{paymentId}
  paid_at TIMESTAMP NULL,              -- Set when admin confirms
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id),
  INDEX idx_user_payments (user_id),
  INDEX idx_status (payment_status)
);
```

### 3.2 Existing Table Updates

#### Update `courses` table
```sql
ALTER TABLE courses 
ADD COLUMN access_level ENUM('BASIC', 'PLUS', 'PREMIUM') DEFAULT 'BASIC' AFTER difficulty;

-- Map existing courses based on difficulty
UPDATE courses SET access_level = 'BASIC' WHERE difficulty = 'BEGINNER';
UPDATE courses SET access_level = 'PLUS' WHERE difficulty = 'INTERMEDIATE';
UPDATE courses SET access_level = 'PREMIUM' WHERE difficulty = 'ADVANCED';
```

---

## 4. BACKEND IMPLEMENTATION (Formation Service)

All subscription functionality will be added to the existing `Formation_service` (Port 8086).

### 4.1 New Entities

#### SubscriptionPlan.java
```java
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;           // "Basic", "Plus", "Premium"
    private String slug;           // "basic", "plus", "premium"
    private BigDecimal priceMonthly;
    private String currency;       // "DT"
    private Integer monthlyEnrollmentLimit;  // NULL for unlimited
    
    @Enumerated(EnumType.STRING)
    private AccessLevel accessLevel;
    
    @Column(columnDefinition = "JSON")
    private String features;       // JSON array of features
    
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### UserSubscription.java
```java
@Entity
@Table(name = "user_subscriptions")
public class UserSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;           // FK to user-service
    
    @ManyToOne
    @JoinColumn(name = "plan_id")
    private SubscriptionPlan plan;
    
    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status;  // PENDING, ACTIVE, CANCELLED, EXPIRED
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime cancelledAt;
}
```

#### SubscriptionPayment.java
```java
@Entity
@Table(name = "subscription_payments")
public class SubscriptionPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "subscription_id")
    private UserSubscription subscription;
    
    private Long userId;
    private BigDecimal amount;
    private String currency;       // "DT"
    private String paymentMethod;  // "MANUAL"
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;  // PENDING, COMPLETED, FAILED, REFUNDED
    
    private String transactionId;  // SKILLSPHERE-{userId}-{paymentId}
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### New Enums
```java
public enum AccessLevel {
    BASIC, PLUS, PREMIUM
}

public enum SubscriptionStatus {
    PENDING, ACTIVE, CANCELLED, EXPIRED
}

public enum PaymentStatus {
    PENDING, COMPLETED, FAILED, REFUNDED
}
```

### 4.2 Repositories

```java
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findBySlug(String slug);
    List<SubscriptionPlan> findByIsActiveTrue();
}

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    Optional<UserSubscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);
    List<UserSubscription> findByUserId(Long userId);
    
    @Query("SELECT s FROM UserSubscription s WHERE s.status = 'ACTIVE' AND s.endDate < :now")
    List<UserSubscription> findExpiredSubscriptions(@Param("now") LocalDateTime now);
}

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, Long> {
    List<SubscriptionPayment> findByUserId(Long userId);
    List<SubscriptionPayment> findByPaymentStatus(PaymentStatus status);
}
```

### 4.3 Services

#### SubscriptionPlanService
```java
- List<SubscriptionPlan> getAllActivePlans()
- SubscriptionPlan getPlanBySlug(String slug)
- SubscriptionPlan createPlan(SubscriptionPlan plan)  // Admin only
- SubscriptionPlan updatePlan(Long id, SubscriptionPlan plan)  // Admin only
```

#### UserSubscriptionService
```java
- UserSubscription getUserActiveSubscription(Long userId)
- UserSubscription createSubscriptionRequest(Long userId, String planSlug)
- void cancelSubscription(Long userId)
- void checkAndExpireSubscriptions()  // Called during access checks
```

#### PaymentService
```java
- SubscriptionPayment createPaymentRequest(Long subscriptionId, Long userId, BigDecimal amount)
- SubscriptionPayment confirmPayment(Long paymentId)  // Admin only - activates subscription
- SubscriptionPayment rejectPayment(Long paymentId)  // Admin only
- List<SubscriptionPayment> getPendingPayments()  // Admin only
- List<SubscriptionPayment> getUserPaymentHistory(Long userId)
- String generateTransactionId(Long userId, Long paymentId)  // SKILLSPHERE-{userId}-{paymentId}
```

#### AccessControlService
```java
- void checkCanEnroll(Long userId, Long courseId) throws AccessDeniedException
- int getMonthlyEnrollmentCount(Long userId)
- boolean hasActiveSubscription(Long userId)
```

**checkCanEnroll() Logic:**
```java
public void checkCanEnroll(Long userId, Long courseId) {
    // 1. Get user's active subscription
    UserSubscription subscription = getUserActiveSubscription(userId);
    if (subscription == null) {
        throw new AccessDeniedException("PLAN_REQUIRED", "You need an active subscription to enroll");
    }
    
    // 2. Check if subscription expired (lazy expiration)
    if (subscription.getEndDate().isBefore(LocalDateTime.now())) {
        subscription.setStatus(SubscriptionStatus.EXPIRED);
        subscriptionRepository.save(subscription);
        throw new AccessDeniedException("PLAN_REQUIRED", "Your subscription has expired");
    }
    
    // 3. Get course and check access level
    Course course = courseRepository.findById(courseId).orElseThrow();
    AccessLevel userLevel = subscription.getPlan().getAccessLevel();
    AccessLevel courseLevel = course.getAccessLevel();
    
    if (!canAccessLevel(userLevel, courseLevel)) {
        throw new AccessDeniedException("UPGRADE_REQUIRED", "Upgrade your plan to access this course");
    }
    
    // 4. Check monthly limit
    Integer limit = subscription.getPlan().getMonthlyEnrollmentLimit();
    if (limit != null) {  // NULL = unlimited
        int count = getMonthlyEnrollmentCount(userId);
        if (count >= limit) {
            throw new AccessDeniedException("MONTHLY_LIMIT_REACHED", "You've reached your monthly enrollment limit");
        }
    }
}

private boolean canAccessLevel(AccessLevel userLevel, AccessLevel courseLevel) {
    if (userLevel == AccessLevel.PREMIUM) return true;
    if (userLevel == AccessLevel.PLUS) return courseLevel != AccessLevel.PREMIUM;
    if (userLevel == AccessLevel.BASIC) return courseLevel == AccessLevel.BASIC;
    return false;
}

private int getMonthlyEnrollmentCount(Long userId) {
    LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
    return enrollmentRepository.countByUserIdAndCreatedAtAfterAndStatusNot(
        userId, startOfMonth, EnrollmentStatus.CANCELLED
    );
}
```

#### EmailService (Simple - in Formation Service)
```java
- void sendPaymentRequestEmail(Long userId, String planName, String transactionId)
- void sendPaymentConfirmationEmail(Long userId, String planName, LocalDateTime endDate)
```

**Note:** For demo purposes, EmailService can just log to console or use Spring Boot Mail with a simple SMTP configuration.

### 4.4 Controllers

#### SubscriptionPlanController - `/api/subscription-plans`
```java
GET /                    // Get all active plans (public)
GET /{id}               // Get plan details (public)
POST /                  // Create plan (admin only)
PUT /{id}               // Update plan (admin only)
```

#### UserSubscriptionController - `/api/subscriptions`
```java
GET /me                 // Get my active subscription (requires JWT)
POST /checkout?planSlug=plus  // Create subscription request (requires JWT)
POST /cancel            // Cancel my subscription (requires JWT)
```

#### PaymentController - `/api/payments`
```java
GET /history            // Get my payment history (requires JWT)
GET /admin/pending      // Get all pending payments (admin only)
POST /admin/{id}/confirm  // Confirm payment (admin only)
POST /admin/{id}/reject   // Reject payment (admin only)
```

### 4.5 Integration with EnrollmentService

Update `EnrollmentService.createEnrollment()`:
```java
public Enrollment createEnrollment(Long userId, Long courseId) {
    // NEW: Check access control FIRST
    accessControlService.checkCanEnroll(userId, courseId);
    
    // Existing enrollment logic
    Enrollment enrollment = new Enrollment();
    enrollment.setUserId(userId);
    enrollment.setCourseId(courseId);
    enrollment.setStatus(EnrollmentStatus.ACTIVE);
    return enrollmentRepository.save(enrollment);
}
```

---

## 5. MANUAL PAYMENT FLOW

### 5.1 User Flow: Request Subscription

1. User visits `/pricing` and selects a plan
2. User clicks "Choose Plan" → redirected to `/checkout?plan=plus`
3. Checkout page shows:
   - Selected plan summary (name, price, features)
   - Payment instructions
   - Payment reference: `SKILLSPHERE-{userId}-{paymentId}`
   - Bank details (demo placeholders):
     - Bank: "BIAT (Example)"
     - RIB: "XXXX XXXX XXXX XXXX XXXX" (masked)
     - Email: support@skillsphere.tn
     - Phone: 26512108
4. User clicks "Request Subscription"
5. Backend creates:
   - `user_subscriptions` row with status=PENDING
   - `subscription_payments` row with payment_status=PENDING
6. Frontend shows: "Your request is pending. Admin will confirm within 24h."
7. (Optional) Email sent to user with payment instructions

### 5.2 Admin Flow: Confirm Payment

1. Admin visits `/admin/payments`
2. Admin sees list of pending payments with:
   - User name/email
   - Plan name
   - Amount
   - Transaction ID (SKILLSPHERE-7-332)
   - Request date
3. Admin clicks "Confirm" on a payment
4. Backend updates:
   - `subscription_payments.payment_status` = COMPLETED
   - `subscription_payments.paid_at` = now
   - `user_subscriptions.status` = ACTIVE
   - `user_subscriptions.start_date` = now
   - `user_subscriptions.end_date` = now + 30 days
5. (Optional) Email sent to user: "Your subscription is now active!"
6. User can now enroll in courses based on their plan

### 5.3 Admin Flow: Reject Payment

1. Admin clicks "Reject" on a pending payment
2. Backend updates:
   - `subscription_payments.payment_status` = FAILED
   - `user_subscriptions.status` remains PENDING (or set to CANCELLED)
3. User sees "Payment rejected" message

### 5.4 Cancellation Flow

1. User visits `/account/subscription`
2. User clicks "Cancel Subscription"
3. Backend updates:
   - `user_subscriptions.status` = CANCELLED
   - `user_subscriptions.cancelled_at` = now
4. User keeps access until `end_date`
5. After `end_date`, lazy expiration marks it as EXPIRED

### 5.5 Refund Flow (Optional)

1. Admin visits `/admin/payments`
2. Admin clicks "Refund" on a completed payment
3. Backend updates:
   - `subscription_payments.payment_status` = REFUNDED
   - `user_subscriptions.status` = CANCELLED
4. User loses access immediately

---

## 6. FRONTEND IMPLEMENTATION (Angular)

### 6.1 New Models

#### subscription.model.ts
```typescript
export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  priceMonthly: number;
  currency: string;
  monthlyEnrollmentLimit: number | null;
  accessLevel: 'BASIC' | 'PLUS' | 'PREMIUM';
  features: string[];
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
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId: string;
  paidAt: string;
  createdAt: string;
}
```

### 6.2 New Service

#### subscription.service.ts
```typescript
// Public endpoints
getActivePlans(): Observable<SubscriptionPlan[]>
getPlanBySlug(slug: string): Observable<SubscriptionPlan>

// User endpoints (requires JWT)
getMySubscription(): Observable<UserSubscription>
requestSubscription(planSlug: string): Observable<UserSubscription>
cancelSubscription(): Observable<void>
getMyPaymentHistory(): Observable<SubscriptionPayment[]>

// Admin endpoints
getPendingPayments(): Observable<SubscriptionPayment[]>
confirmPayment(paymentId: number): Observable<SubscriptionPayment>
rejectPayment(paymentId: number): Observable<SubscriptionPayment>
```

### 6.3 New Pages

#### 1. Pricing Page (`/pricing`)
**Component:** `PricingComponent`
**Features:**
- Display 3 plan cards (Basic, Plus, Premium)
- Show price in DT
- List features for each plan
- "Choose Plan" button → redirects to `/checkout?plan=slug`
- Highlight recommended plan (Plus)
- FAQ section at bottom

#### 2. Checkout Page (`/checkout?plan=plus`)
**Component:** `CheckoutComponent`
**Features:**
- Display selected plan summary
- Show payment instructions:
  - Bank: BIAT (Example)
  - RIB: XXXX XXXX XXXX XXXX XXXX
  - Email: support@skillsphere.tn
  - Phone: 26512108
- Display payment reference: `SKILLSPHERE-{userId}-{paymentId}`
- "Request Subscription" button
- After request: Show "Pending confirmation" message
- Redirect to `/account/subscription` after 3 seconds

#### 3. Subscription Management (`/account/subscription`)
**Component:** `SubscriptionManagementComponent`
**Features:**
- Show current subscription status (PENDING/ACTIVE/EXPIRED)
- Display plan details (name, price, end date)
- Show monthly usage: "3 / 5 enrollments this month"
- "Cancel Subscription" button (if ACTIVE)
- "Upgrade Plan" button (if not Premium)
- Payment history table
- If no subscription: "Subscribe Now" button → `/pricing`

#### 4. Admin Payments Page (`/admin/payments`)
**Component:** `AdminPaymentsComponent`
**Features:**
- Table of pending payments with columns:
  - User (name/email)
  - Plan
  - Amount
  - Transaction ID
  - Request Date
  - Actions (Confirm / Reject buttons)
- Filter by status (Pending / Completed / Failed)
- Search by transaction ID or user
- Confirm dialog before confirming/rejecting

### 6.4 Updated Pages

#### Course Catalog (`/learning/catalog`)
**Updates:**
- Add badge to each course card showing access level (BASIC/PLUS/PREMIUM)
- Show lock icon on courses user cannot access
- If locked: "Upgrade to {plan} to access" button → `/pricing`
- If no subscription: "Subscribe to enroll" button → `/pricing`

#### Course Detail (`/learning/course/:id`)
**Updates:**
- Check user subscription before showing "Enroll" button
- If no subscription: Show "Subscribe to enroll" prompt
- If insufficient plan: Show "Upgrade to {plan} to access" prompt
- If monthly limit reached: Show "Upgrade for more enrollments" prompt
- Display "Included in your plan" badge if accessible

#### User Profile (`/user/profile`)
**Updates:**
- Add subscription section showing current plan badge
- Quick link to `/account/subscription`

#### Admin Dashboard (`/admin/dashboard`)
**Updates:**
- Add subscription statistics card:
  - Total active subscriptions
  - Revenue this month
  - Pending payments count
- Link to `/admin/payments`

### 6.5 New Components

#### SubscriptionBadge Component
- Small badge showing plan name (Basic/Plus/Premium)
- Color-coded: Basic=blue, Plus=purple, Premium=gold
- Used in navbar, profile, course cards

#### UpgradePrompt Component
- Modal/alert prompting user to upgrade
- Shows benefits of higher plan
- "Upgrade Now" button → `/pricing`
- Used when user tries to access restricted content

#### PlanCard Component
- Reusable card for displaying plan details
- Used in pricing page
- Shows price, features, CTA button
```

---

## 7. ADMIN FEATURES

### 7.1 Payment Management (`/admin/payments`)
- View all payments (pending, completed, failed, refunded)
- Filter by status and date range
- Search by transaction ID or user
- Confirm pending payments → activates subscription
- Reject pending payments → marks as failed
- Refund completed payments → cancels subscription

### 7.2 Subscription Analytics (`/admin/dashboard`)
- Total active subscriptions by plan
- Revenue this month (sum of completed payments)
- Pending payments count
- Churn rate (cancelled subscriptions)
- Monthly recurring revenue (MRR)
- New subscriptions this month

### 7.3 Plan Management (Optional - Future)
- Create/edit/delete plans
- Set pricing and limits
- Enable/disable plans
- Feature configuration

---

## 8. IMPLEMENTATION PHASES

### Phase 1: Database Setup (30 minutes)
- [ ] Create SQL migration file
- [ ] Add 3 new tables: `subscription_plans`, `user_subscriptions`, `subscription_payments`
- [ ] Add `access_level` column to `courses` table
- [ ] Insert 3 default plans (Basic 25 DT, Plus 45 DT, Premium 75 DT)
- [ ] Update existing courses with access_level based on difficulty
- [ ] Test migration on local database

### Phase 2: Backend Entities & Repositories (1 hour)
- [ ] Create `SubscriptionPlan.java` entity
- [ ] Create `UserSubscription.java` entity
- [ ] Create `SubscriptionPayment.java` entity
- [ ] Create enums: `AccessLevel`, `SubscriptionStatus`, `PaymentStatus`
- [ ] Create repositories for all 3 entities
- [ ] Add custom queries for finding active subscriptions and pending payments

### Phase 3: Backend Services (2 hours)
- [ ] Create `SubscriptionPlanService` with CRUD methods
- [ ] Create `UserSubscriptionService` with subscription lifecycle methods
- [ ] Create `PaymentService` with payment processing methods
- [ ] Create `AccessControlService` with `checkCanEnroll()` method
- [ ] Create `EmailService` with basic email methods (log to console for demo)
- [ ] Add transaction ID generation: `SKILLSPHERE-{userId}-{paymentId}`

### Phase 4: Backend Controllers (1 hour)
- [ ] Create `SubscriptionPlanController` with GET endpoints
- [ ] Create `UserSubscriptionController` with user endpoints
- [ ] Create `PaymentController` with admin endpoints
- [ ] Add JWT authentication to protected endpoints
- [ ] Add role-based authorization (ADMIN for admin endpoints)

### Phase 5: Enrollment Integration (30 minutes)
- [ ] Update `EnrollmentService.createEnrollment()` to call `AccessControlService.checkCanEnroll()`
- [ ] Add error handling for 403 responses with error codes
- [ ] Update `EnrollmentRepository` to add monthly count query
- [ ] Test enrollment with different subscription scenarios

### Phase 6: Frontend Models & Service (1 hour)
- [ ] Create `subscription.model.ts` with interfaces
- [ ] Create `subscription.service.ts` with API methods
- [ ] Update `formation.service.ts` to handle 403 errors from enrollment
- [ ] Add error code handling: `PLAN_REQUIRED`, `UPGRADE_REQUIRED`, `MONTHLY_LIMIT_REACHED`

### Phase 7: Frontend - Pricing & Checkout (2 hours)
- [ ] Create `PricingComponent` with 3 plan cards
- [ ] Style plan cards with gradient and animations
- [ ] Create `CheckoutComponent` with payment instructions
- [ ] Display payment reference and bank details
- [ ] Add "Request Subscription" button
- [ ] Show pending confirmation message
- [ ] Add routing: `/pricing`, `/checkout`

### Phase 8: Frontend - Subscription Management (2 hours)
- [ ] Create `SubscriptionManagementComponent`
- [ ] Display current subscription status and details
- [ ] Show monthly usage (enrollments count)
- [ ] Add "Cancel Subscription" button with confirm dialog
- [ ] Display payment history table
- [ ] Add "Upgrade Plan" button
- [ ] Add routing: `/account/subscription`

### Phase 9: Frontend - Admin Payments (1.5 hours)
- [ ] Create `AdminPaymentsComponent`
- [ ] Display pending payments table
- [ ] Add "Confirm" and "Reject" buttons with confirm dialog
- [ ] Add filter by status
- [ ] Add search by transaction ID
- [ ] Show toast notifications on success/error
- [ ] Add routing: `/admin/payments`
- [ ] Add link from admin dashboard

### Phase 10: Frontend - Access Control UI (2 hours)
- [ ] Update `CourseCatalogComponent` to show access level badges
- [ ] Add lock icons for inaccessible courses
- [ ] Create `UpgradePromptComponent` modal
- [ ] Update `CourseDetailComponent` to check subscription before showing enroll
- [ ] Show appropriate prompts: "Subscribe", "Upgrade", "Limit Reached"
- [ ] Create `SubscriptionBadgeComponent` for navbar/profile
- [ ] Update admin dashboard with subscription stats

### Phase 11: Testing & Bug Fixes (2 hours)
- [ ] Test complete user flow: pricing → checkout → admin confirm → enroll
- [ ] Test access control: try enrolling without subscription
- [ ] Test monthly limits: enroll 5 times with Basic plan
- [ ] Test upgrade scenarios: Basic → Plus → Premium
- [ ] Test cancellation flow
- [ ] Test lazy expiration (manually set end_date in past)
- [ ] Fix any bugs found
- [ ] Test on different browsers

### Phase 12: Polish & Documentation (1 hour)
- [ ] Add loading states to all async operations
- [ ] Improve error messages (French)
- [ ] Add animations and transitions
- [ ] Update PROJECT_COMPLETE_DOCUMENTATION.md
- [ ] Create SUBSCRIPTION_GUIDE.md with user instructions
- [ ] Test dark mode compatibility
- [ ] Final review and cleanup

**Total Estimated Time: 16-18 hours**

---

## 9. ERROR CODES & MESSAGES

### Backend Error Responses

```json
// No subscription
{
  "code": "PLAN_REQUIRED",
  "message": "Vous devez avoir un abonnement actif pour vous inscrire à ce cours",
  "status": 403
}

// Insufficient plan
{
  "code": "UPGRADE_REQUIRED",
  "message": "Mettez à niveau votre abonnement pour accéder à ce cours",
  "requiredPlan": "PLUS",
  "status": 403
}

// Monthly limit reached
{
  "code": "MONTHLY_LIMIT_REACHED",
  "message": "Vous avez atteint votre limite mensuelle d'inscriptions",
  "currentCount": 5,
  "limit": 5,
  "status": 403
}
```

### Frontend Error Handling

```typescript
enrollInCourse(courseId: number) {
  this.formationService.enrollInCourse(courseId).subscribe({
    next: () => this.toastService.success('Inscription réussie'),
    error: (error) => {
      if (error.status === 403) {
        switch (error.error.code) {
          case 'PLAN_REQUIRED':
            this.router.navigate(['/pricing']);
            break;
          case 'UPGRADE_REQUIRED':
            this.showUpgradePrompt(error.error.requiredPlan);
            break;
          case 'MONTHLY_LIMIT_REACHED':
            this.showLimitReachedPrompt();
            break;
        }
      }
    }
  });
}
```

---

## 10. TECHNICAL CONSIDERATIONS

### Security
- Validate JWT tokens on all protected endpoints
- Check user role (ADMIN) for admin endpoints
- Sanitize all inputs
- Use parameterized queries to prevent SQL injection
- Don't expose sensitive payment data in responses

### Performance
- Index database columns: `user_id`, `status`, `end_date`, `payment_status`
- Cache active subscription in user session (invalidate on changes)
- Use lazy loading for payment history
- Optimize enrollment count query with proper indexes

### Data Integrity
- Use database transactions for payment confirmation (update payment + subscription atomically)
- Add foreign key constraints
- Add NOT NULL constraints where appropriate
- Validate dates: `end_date > start_date`

### User Experience
- Show clear error messages in French
- Add loading spinners during API calls
- Use toast notifications for success/error
- Add confirm dialogs for destructive actions (cancel, reject)
- Make payment instructions very clear and visible

---

## 11. DEMO PLACEHOLDERS

For university presentation, use these placeholder values:

### Bank Information
- Bank Name: "BIAT (Example)"
- RIB: "XXXX XXXX XXXX XXXX XXXX" (masked)
- Account Name: "SkillSphere Platform"

### Contact Information
- Email: support@skillsphere.tn
- Phone: 26512108
- Support Hours: "Lundi - Vendredi, 9h - 17h"

### Transaction ID Format
- Format: `SKILLSPHERE-{userId}-{paymentId}`
- Example: `SKILLSPHERE-7-332`

---

## 12. FUTURE ENHANCEMENTS (Post-MVP)

### Phase 2 Features
- Annual billing option (save 17%)
- Automatic subscription renewal
- Email notifications (real SMTP integration)
- Invoice PDF generation
- Discount codes / promo codes
- Student discounts
- Referral program

### Enterprise Features
- Corporate subscriptions
- Team management
- Bulk licensing
- Custom pricing
- Dedicated support
- Usage analytics for admins

---

## NEXT STEPS

Ready to start implementation? Here's the recommended order:

1. **Start with Phase 1** - Database setup (quick win, foundation for everything)
2. **Then Phase 2-5** - Complete backend (can test with Postman)
3. **Then Phase 6-10** - Complete frontend (visual progress)
4. **Finally Phase 11-12** - Testing and polish

Would you like to begin with Phase 1 (Database Setup)?
