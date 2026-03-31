package org.example.formation_service.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.formation_service.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPaymentResponse {
    private Long id;
    private Long subscriptionId;
    private Long userId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private String transactionId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private String planName;  // For admin view
    private String userEmail; // For admin view (will be populated from user service if needed)
    
    // New fields for automatic payment system
    private String customerEmail;  // Email used for OTP
    private String maskedCard;     // Masked card number (e.g., "**** **** **** 1234")
    private String cardBrand;      // Card brand (VISA, MASTERCARD, etc.)
    private LocalDateTime otpSentAt; // When OTP was sent
}
