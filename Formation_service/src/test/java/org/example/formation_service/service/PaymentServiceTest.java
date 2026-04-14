package org.example.formation_service.service;

import org.example.formation_service.domain.entity.*;
import org.example.formation_service.domain.enums.PaymentStatus;
import org.example.formation_service.domain.enums.SubscriptionStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private SubscriptionPaymentRepository paymentRepository;
    @Mock private UserSubscriptionRepository subscriptionRepository;
    @Mock private EmailService emailService;

    @InjectMocks private PaymentService paymentService;

    private SubscriptionPlan plan;
    private UserSubscription subscription;
    private SubscriptionPayment payment;

    @BeforeEach
    void setUp() {
        plan = new SubscriptionPlan();
        plan.setId(1L);
        plan.setName("Premium");

        subscription = new UserSubscription();
        subscription.setId(1L);
        subscription.setPlan(plan);
        subscription.setStatus(SubscriptionStatus.PENDING);

        payment = new SubscriptionPayment();
        payment.setId(1L);
        payment.setUserId(1L);
        payment.setSubscription(subscription);
        payment.setAmount(new BigDecimal("99.00"));
        payment.setPaymentStatus(PaymentStatus.PENDING);
    }

    // ── generateTransactionId ─────────────────────────────────────────────────

    @Test
    void generateTransactionId_shouldFollowFormat() {
        String txId = paymentService.generateTransactionId(5L, 10L);
        assertThat(txId).isEqualTo("SKILLSPHERE-5-10");
    }

    @Test
    void generateTransactionId_shouldBeUnique_forDifferentUsers() {
        String tx1 = paymentService.generateTransactionId(1L, 1L);
        String tx2 = paymentService.generateTransactionId(2L, 1L);
        assertThat(tx1).isNotEqualTo(tx2);
    }

    // ── createPaymentRequest ──────────────────────────────────────────────────

    @Test
    void createPaymentRequest_shouldThrow_whenSubscriptionNotFound() {
        when(subscriptionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.createPaymentRequest(99L, 1L, BigDecimal.TEN))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("not found");
    }

    @Test
    void createPaymentRequest_shouldCreatePendingPayment() {
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(subscription));
        when(paymentRepository.save(any(SubscriptionPayment.class)))
            .thenAnswer(i -> {
                SubscriptionPayment p = i.getArgument(0);
                p.setId(1L);
                return p;
            });
        doNothing().when(emailService).sendPaymentRequestEmail(anyLong(), anyString(), anyString());

        SubscriptionPayment result = paymentService.createPaymentRequest(1L, 1L, new BigDecimal("99.00"));

        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(result.getTransactionId()).contains("SKILLSPHERE");
        verify(emailService).sendPaymentRequestEmail(eq(1L), eq("Premium"), anyString());
    }

    // ── confirmPayment ────────────────────────────────────────────────────────

    @Test
    void confirmPayment_shouldThrow_whenPaymentNotFound() {
        when(paymentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.confirmPayment(99L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("not found");
    }

    @Test
    void confirmPayment_shouldThrow_whenPaymentNotPending() {
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.confirmPayment(1L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("not pending");
    }

    @Test
    void confirmPayment_shouldActivateSubscription() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(subscriptionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        doNothing().when(emailService).sendPaymentConfirmationEmail(anyLong(), anyString(), any());

        SubscriptionPayment result = paymentService.confirmPayment(1L);

        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(result.getPaidAt()).isNotNull();
        assertThat(subscription.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(subscription.getEndDate()).isNotNull();
        verify(emailService).sendPaymentConfirmationEmail(anyLong(), anyString(), any());
    }

    // ── rejectPayment ─────────────────────────────────────────────────────────

    @Test
    void rejectPayment_shouldThrow_whenNotPending() {
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.rejectPayment(1L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("not pending");
    }

    @Test
    void rejectPayment_shouldSetStatusFailed() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        SubscriptionPayment result = paymentService.rejectPayment(1L);

        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    // ── getPendingPayments ────────────────────────────────────────────────────

    @Test
    void getPendingPayments_shouldReturnOnlyPending() {
        when(paymentRepository.findByPaymentStatus(PaymentStatus.PENDING))
            .thenReturn(List.of(payment));

        List<SubscriptionPayment> result = paymentService.getPendingPayments();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
    }

    // ── getUserPaymentHistory ─────────────────────────────────────────────────

    @Test
    void getUserPaymentHistory_shouldReturnUserPayments() {
        when(paymentRepository.findByUserId(1L)).thenReturn(List.of(payment));

        List<SubscriptionPayment> result = paymentService.getUserPaymentHistory(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
    }
}
