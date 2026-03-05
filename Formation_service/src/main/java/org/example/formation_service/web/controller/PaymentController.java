package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.SubscriptionPayment;
import org.example.formation_service.service.PaymentService;
import org.example.formation_service.web.dto.SubscriptionPaymentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @GetMapping("/history")
    public ResponseEntity<List<SubscriptionPaymentResponse>> getMyPaymentHistory(@RequestHeader("X-User-Id") Long userId) {
        log.info("Fetching payment history for user: {}", userId);
        List<SubscriptionPayment> payments = paymentService.getUserPaymentHistory(userId);
        List<SubscriptionPaymentResponse> responses = payments.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/admin/pending")
    public ResponseEntity<List<SubscriptionPaymentResponse>> getPendingPayments() {
        log.info("Fetching pending payments (admin)");
        List<SubscriptionPayment> payments = paymentService.getPendingPayments();
        List<SubscriptionPaymentResponse> responses = payments.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<List<SubscriptionPaymentResponse>> getAllPayments() {
        log.info("Fetching all payments (admin)");
        List<SubscriptionPayment> payments = paymentService.getAllPayments();
        List<SubscriptionPaymentResponse> responses = payments.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @PostMapping("/admin/{id}/confirm")
    public ResponseEntity<SubscriptionPaymentResponse> confirmPayment(@PathVariable Long id) {
        log.info("Admin confirming payment: {}", id);
        SubscriptionPayment payment = paymentService.confirmPayment(id);
        log.info("Payment confirmed successfully: {}", id);
        return ResponseEntity.ok(toResponse(payment));
    }
    
    @PostMapping("/admin/{id}/reject")
    public ResponseEntity<SubscriptionPaymentResponse> rejectPayment(@PathVariable Long id) {
        log.info("Admin rejecting payment: {}", id);
        SubscriptionPayment payment = paymentService.rejectPayment(id);
        log.info("Payment rejected: {}", id);
        return ResponseEntity.ok(toResponse(payment));
    }
    
    private SubscriptionPaymentResponse toResponse(SubscriptionPayment payment) {
        return SubscriptionPaymentResponse.builder()
            .id(payment.getId())
            .subscriptionId(payment.getSubscription().getId())
            .userId(payment.getUserId())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .paymentMethod(payment.getPaymentMethod())
            .paymentStatus(payment.getPaymentStatus())
            .transactionId(payment.getTransactionId())
            .paidAt(payment.getPaidAt())
            .createdAt(payment.getCreatedAt())
            .planName(payment.getSubscription().getPlan().getName())
            .customerEmail(payment.getCustomerEmail())
            .maskedCard(payment.getMaskedCard())
            .cardBrand(payment.getCardBrand())
            .otpSentAt(payment.getOtpSentAt())
            .build();
    }
}
