package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.SubscriptionPayment;
import org.example.formation_service.domain.entity.UserSubscription;
import org.example.formation_service.domain.enums.PaymentStatus;
import org.example.formation_service.domain.enums.SubscriptionStatus;
import org.example.formation_service.repository.SubscriptionPaymentRepository;
import org.example.formation_service.repository.UserSubscriptionRepository;
import org.example.formation_service.service.EmailService;
import org.example.formation_service.web.dto.SubscriptionPaymentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Simulated Payment Controller
 * 
 * This controller simulates automatic payment processing for demo purposes.
 * In production, this would be replaced by real payment gateway webhooks.
 * 
 * Flow:
 * 1. User creates checkout (existing endpoint)
 * 2. User clicks "Pay Now" 
 * 3. Frontend calls /simulate-success
 * 4. Backend automatically:
 *    - Marks payment as COMPLETED
 *    - Activates subscription
 *    - Sets dates
 *    - Sends confirmation email
 * 5. User is redirected to success page
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SimulatedPaymentController {
    
    private final SubscriptionPaymentRepository paymentRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final EmailService emailService;
    
    /**
     * Simulate successful payment (for demo purposes)
     * 
     * This endpoint simulates what a payment gateway webhook would do:
     * - Verify payment
     * - Update payment status
     * - Activate subscription
     * - Send confirmation email
     * 
     * In production, this would be called by Flouci/Stripe webhook
     */
    @PostMapping("/{paymentId}/simulate-success")
    public ResponseEntity<SubscriptionPaymentResponse> simulatePaymentSuccess(
            @PathVariable Long paymentId,
            @RequestHeader("X-User-Id") Long userId) {
        
        log.info("🎭 Simulating payment success for payment ID: {}, user ID: {}", paymentId, userId);
        
        // Find the payment
        SubscriptionPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        // Verify it belongs to the user
        if (!payment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Payment does not belong to user");
        }
        
        // Verify payment is in PENDING status
        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("Payment is not in PENDING status");
        }
        
        // Simulate payment processing delay (optional - makes it feel more realistic)
        try {
            Thread.sleep(1000); // 1 second delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Update payment status
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);
        
        log.info("✅ Payment marked as COMPLETED");
        
        // Find and activate the subscription
        UserSubscription subscription = payment.getSubscription();
        
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusDays(30));
        subscription = subscriptionRepository.save(subscription);
        
        log.info("✅ Subscription activated: ID {}, Plan: {}, Valid until: {}", 
                subscription.getId(), 
                subscription.getPlan().getName(), 
                subscription.getEndDate());
        
        // Send confirmation email
        emailService.sendPaymentConfirmationEmail(
                userId, 
                subscription.getPlan().getName(), 
                subscription.getEndDate()
        );
        
        log.info("📧 Confirmation email sent to user {}", userId);
        log.info("🎉 Payment simulation completed successfully!");
        
        // Return payment response
        return ResponseEntity.ok(toResponse(payment));
    }
    
    /**
     * Simulate failed payment (optional - for testing error handling)
     */
    @PostMapping("/{paymentId}/simulate-failure")
    public ResponseEntity<SubscriptionPaymentResponse> simulatePaymentFailure(
            @PathVariable Long paymentId,
            @RequestHeader("X-User-Id") Long userId) {
        
        log.info("🎭 Simulating payment failure for payment ID: {}, user ID: {}", paymentId, userId);
        
        SubscriptionPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        if (!payment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        payment.setPaymentStatus(PaymentStatus.FAILED);
        payment = paymentRepository.save(payment);
        
        log.info("❌ Payment marked as FAILED");
        
        return ResponseEntity.ok(toResponse(payment));
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
                .build();
    }
}
