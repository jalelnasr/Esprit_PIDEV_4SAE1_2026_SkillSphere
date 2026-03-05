package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.SubscriptionPayment;
import org.example.formation_service.domain.entity.UserSubscription;
import org.example.formation_service.domain.enums.PaymentStatus;
import org.example.formation_service.domain.enums.SubscriptionStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.SubscriptionPaymentRepository;
import org.example.formation_service.repository.UserSubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final SubscriptionPaymentRepository paymentRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final EmailService emailService;
    
    @Transactional
    public SubscriptionPayment createPaymentRequest(Long subscriptionId, Long userId, BigDecimal amount) {
        UserSubscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new BusinessException("SUBSCRIPTION_NOT_FOUND", "Subscription not found"));
        
        SubscriptionPayment payment = SubscriptionPayment.builder()
            .subscription(subscription)
            .userId(userId)
            .amount(amount)
            .currency("DT")
            .paymentMethod("MANUAL")
            .paymentStatus(PaymentStatus.PENDING)
            .build();
        
        payment = paymentRepository.save(payment);
        
        // Generate transaction ID after saving to get the payment ID
        String transactionId = generateTransactionId(userId, payment.getId());
        payment.setTransactionId(transactionId);
        payment = paymentRepository.save(payment);
        
        // Send payment request email
        emailService.sendPaymentRequestEmail(userId, subscription.getPlan().getName(), transactionId);
        
        return payment;
    }
    
    @Transactional
    public SubscriptionPayment confirmPayment(Long paymentId) {
        SubscriptionPayment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new BusinessException("PAYMENT_NOT_FOUND", "Payment not found"));
        
        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new BusinessException("INVALID_PAYMENT_STATUS", "Payment is not pending");
        }
        
        // Update payment status
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
        
        // Activate subscription
        UserSubscription subscription = payment.getSubscription();
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusDays(30));
        subscriptionRepository.save(subscription);
        
        // Send confirmation email
        emailService.sendPaymentConfirmationEmail(
            payment.getUserId(),
            subscription.getPlan().getName(),
            subscription.getEndDate()
        );
        
        return payment;
    }
    
    @Transactional
    public SubscriptionPayment rejectPayment(Long paymentId) {
        SubscriptionPayment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new BusinessException("PAYMENT_NOT_FOUND", "Payment not found"));
        
        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new BusinessException("INVALID_PAYMENT_STATUS", "Payment is not pending");
        }
        
        payment.setPaymentStatus(PaymentStatus.FAILED);
        return paymentRepository.save(payment);
    }
    
    public List<SubscriptionPayment> getPendingPayments() {
        return paymentRepository.findByPaymentStatus(PaymentStatus.PENDING);
    }
    
    public List<SubscriptionPayment> getAllPayments() {
        return paymentRepository.findAll();
    }
    
    public List<SubscriptionPayment> getUserPaymentHistory(Long userId) {
        return paymentRepository.findByUserId(userId);
    }
    
    public String generateTransactionId(Long userId, Long paymentId) {
        return String.format("SKILLSPHERE-%d-%d", userId, paymentId);
    }
}
