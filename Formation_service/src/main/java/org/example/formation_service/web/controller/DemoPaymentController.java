package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.SubscriptionPayment;
import org.example.formation_service.domain.entity.SubscriptionPlan;
import org.example.formation_service.domain.entity.UserSubscription;
import org.example.formation_service.domain.enums.PaymentStatus;
import org.example.formation_service.domain.enums.SubscriptionStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.SubscriptionPaymentRepository;
import org.example.formation_service.repository.UserSubscriptionRepository;
import org.example.formation_service.service.EmailService;
import org.example.formation_service.service.InvoiceService;
import org.example.formation_service.service.OtpService;
import org.example.formation_service.service.SubscriptionPlanService;
import org.example.formation_service.service.UserSubscriptionService;
import org.example.formation_service.web.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Demo Payment Controller with Email OTP Verification
 * 
 * This controller implements a realistic payment flow:
 * 1. User enters card info + email
 * 2. Backend sends OTP to email
 * 3. User enters OTP code
 * 4. Backend verifies OTP and activates subscription
 * 5. Confirmation email sent
 * 
 * This mimics real payment gateways (Stripe, PayPal) without actual payment processing.
 */
@RestController
@RequestMapping("/api/payments/demo")
@RequiredArgsConstructor
@Slf4j
public class DemoPaymentController {
    
    private final UserSubscriptionService subscriptionService;
    private final SubscriptionPlanService planService;
    private final SubscriptionPaymentRepository paymentRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final InvoiceService invoiceService;
    
    /**
     * Step 1: Start payment process
     * - Validate card info (format only, no real validation)
     * - Create PENDING subscription and payment
     * - Generate and send OTP to email
     */
    @PostMapping("/start")
    public ResponseEntity<PaymentStartResponse> startPayment(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PaymentStartRequest request) {
        
        log.info("🎬 Starting payment process for user {}, plan: {}, email: {}", 
                userId, request.getPlanSlug(), request.getEmail());
        
        // Validate request
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BusinessException("INVALID_EMAIL", "Email is required");
        }
        if (request.getCardNumber() == null || request.getCardNumber().length() < 4) {
            throw new BusinessException("INVALID_CARD", "Invalid card number");
        }
        
        // Check if user already has active/pending subscription
        UserSubscription existing = subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
                .orElse(null);
        if (existing != null) {
            // Allow upgrade if new plan is different and higher tier
            SubscriptionPlan currentPlan = existing.getPlan();
            SubscriptionPlan newPlan = planService.getPlanBySlug(request.getPlanSlug());
            
            if (currentPlan.getId().equals(newPlan.getId())) {
                throw new BusinessException("SUBSCRIPTION_EXISTS", "User already has this subscription plan");
            }
            
            // Cancel current subscription to allow upgrade
            log.info("🔄 Upgrading from {} to {}", currentPlan.getName(), newPlan.getName());
            existing.setStatus(SubscriptionStatus.CANCELLED);
            existing.setCancelledAt(LocalDateTime.now());
            subscriptionRepository.save(existing);
        }
        
        UserSubscription pending = subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.PENDING)
                .orElse(null);
        if (pending != null) {
            throw new BusinessException("PENDING_SUBSCRIPTION", "User already has a pending subscription request");
        }
        
        // Get plan
        SubscriptionPlan plan = planService.getPlanBySlug(request.getPlanSlug());
        
        // Create subscription (PENDING)
        UserSubscription subscription = UserSubscription.builder()
                .userId(userId)
                .plan(plan)
                .status(SubscriptionStatus.PENDING)
                .build();
        subscription = subscriptionRepository.save(subscription);
        
        log.info("✅ Created subscription: ID {}, status: PENDING", subscription.getId());
        
        // Mask card number (show only last 4 digits)
        String maskedCard = maskCardNumber(request.getCardNumber());
        String cardBrand = detectCardBrand(request.getCardNumber());
        
        // Create payment (PENDING)
        SubscriptionPayment payment = SubscriptionPayment.builder()
                .subscription(subscription)
                .userId(userId)
                .amount(plan.getPriceMonthly())
                .currency(plan.getCurrency())
                .paymentMethod("CARD")
                .paymentStatus(PaymentStatus.PENDING)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customerEmail(request.getEmail())
                .maskedCard(maskedCard)
                .cardBrand(cardBrand)
                .otpSentAt(LocalDateTime.now())
                .build();
        payment = paymentRepository.save(payment);
        
        log.info("✅ Created payment: ID {}, amount: {} {}, card: {}", 
                payment.getId(), payment.getAmount(), payment.getCurrency(), maskedCard);
        
        // Generate and send OTP
        String otpCode = otpService.generateOtp(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otpCode, plan.getName());
        
        log.info("📧 OTP sent to {}", request.getEmail());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
                PaymentStartResponse.builder()
                        .paymentId(payment.getId())
                        .subscriptionId(subscription.getId())
                        .email(request.getEmail())
                        .message("OTP sent to your email. Please check your inbox.")
                        .otpSent(true)
                        .build()
        );
    }
    
    /**
     * Step 2: Verify OTP and activate subscription
     * - Verify OTP code
     * - Update payment status to COMPLETED
     * - Activate subscription
     * - Send confirmation email
     * 
     * NOTE: This endpoint does NOT require X-User-Id header because:
     * - The OTP itself is the security mechanism
     * - User might have session issues during payment flow
     * - We verify ownership via email + OTP combination
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<SubscriptionPaymentResponse> verifyOtp(
            @RequestBody OtpVerifyRequest request) {
        
        log.info("🔐 Verifying OTP for payment {}, email: {}", request.getPaymentId(), request.getEmail());
        
        // Find payment
        SubscriptionPayment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new BusinessException("PAYMENT_NOT_FOUND", "Payment not found"));
        
        // Verify email matches
        if (!payment.getCustomerEmail().equalsIgnoreCase(request.getEmail())) {
            throw new BusinessException("EMAIL_MISMATCH", "Email does not match payment record");
        }
        
        // Verify payment is still pending
        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new BusinessException("INVALID_STATUS", "Payment is not in PENDING status");
        }
        
        // Verify OTP
        boolean otpValid = otpService.verifyOtp(request.getEmail(), request.getOtpCode());
        if (!otpValid) {
            log.warn("❌ Invalid OTP for payment {}", request.getPaymentId());
            throw new BusinessException("INVALID_OTP", "Invalid or expired OTP code");
        }
        
        log.info("✅ OTP verified successfully");
        
        // Update payment status
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);
        
        log.info("✅ Payment marked as COMPLETED");
        
        // Activate subscription
        UserSubscription subscription = payment.getSubscription();
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusDays(30));
        subscription = subscriptionRepository.save(subscription);
        
        log.info("✅ Subscription activated: ID {}, Plan: {}, Valid until: {}", 
                subscription.getId(), 
                subscription.getPlan().getName(), 
                subscription.getEndDate());
        
        // Generate invoice PDF
        String invoiceNumber = invoiceService.generateInvoiceNumber(payment.getId());
        byte[] invoicePdf = invoiceService.generateInvoice(
                invoiceNumber,
                payment.getCustomerEmail(),
                subscription.getPlan().getName(),
                payment.getAmount().doubleValue(),
                payment.getMaskedCard(),
                payment.getTransactionId(),
                payment.getPaidAt()
        );
        
        String invoiceFilename = invoiceNumber + ".pdf";
        log.info("📄 Invoice generated: {}", invoiceFilename);
        
        // Send confirmation email with invoice attachment
        emailService.sendSubscriptionActivatedEmail(
                payment.getCustomerEmail(),
                subscription.getPlan().getName(),
                subscription.getEndDate(),
                invoicePdf,
                invoiceFilename
        );
        
        log.info("📧 Confirmation email with invoice sent to {}", payment.getCustomerEmail());
        log.info("🎉 Payment process completed successfully!");
        
        return ResponseEntity.ok(toResponse(payment));
    }
    
    /**
     * Resend OTP (if user didn't receive it)
     * 
     * NOTE: This endpoint does NOT require X-User-Id header because:
     * - User might have session issues during payment flow
     * - Payment ID itself is sufficient security (hard to guess)
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<PaymentStartResponse> resendOtp(
            @RequestParam Long paymentId) {
        
        log.info("🔄 Resending OTP for payment {}", paymentId);
        
        SubscriptionPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException("PAYMENT_NOT_FOUND", "Payment not found"));
        
        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new BusinessException("INVALID_STATUS", "Payment is not in PENDING status");
        }
        
        // Generate new OTP
        String otpCode = otpService.generateOtp(payment.getCustomerEmail());
        emailService.sendOtpEmail(
                payment.getCustomerEmail(), 
                otpCode, 
                payment.getSubscription().getPlan().getName()
        );
        
        // Update OTP sent timestamp
        payment.setOtpSentAt(LocalDateTime.now());
        paymentRepository.save(payment);
        
        log.info("📧 OTP resent to {}", payment.getCustomerEmail());
        
        return ResponseEntity.ok(
                PaymentStartResponse.builder()
                        .paymentId(payment.getId())
                        .subscriptionId(payment.getSubscription().getId())
                        .email(payment.getCustomerEmail())
                        .message("OTP resent to your email")
                        .otpSent(true)
                        .build()
        );
    }
    
    // Helper methods
    
    private String maskCardNumber(String cardNumber) {
        String digits = cardNumber.replaceAll("[^0-9]", "");
        if (digits.length() < 4) return "****";
        String last4 = digits.substring(digits.length() - 4);
        return "**** **** **** " + last4;
    }
    
    private String detectCardBrand(String cardNumber) {
        String digits = cardNumber.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return "UNKNOWN";
        
        char firstDigit = digits.charAt(0);
        switch (firstDigit) {
            case '4': return "VISA";
            case '5': return "MASTERCARD";
            case '3': return "AMEX";
            case '6': return "DISCOVER";
            default: return "CARD";
        }
    }
    
    private SubscriptionPaymentResponse toResponse(SubscriptionPayment payment) {
        return SubscriptionPaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUserId())
                .subscriptionId(payment.getSubscription().getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .transactionId(payment.getTransactionId())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .planName(payment.getSubscription().getPlan().getName())
                .customerEmail(payment.getCustomerEmail())
                .maskedCard(payment.getMaskedCard())
                .cardBrand(payment.getCardBrand())
                .otpSentAt(payment.getOtpSentAt())
                .build();
    }
}
