package org.example.formation_service.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.formation_service.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subscription_id", nullable = false)
    private UserSubscription subscription;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(length = 3)
    @Builder.Default
    private String currency = "DT";
    
    @Column(length = 50)
    @Builder.Default
    private String paymentMethod = "MANUAL";
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(length = 100)
    private String transactionId;
    
    @Column
    private LocalDateTime paidAt;
    
    // Email OTP fields
    @Column(length = 255)
    private String customerEmail;
    
    @Column(length = 20)
    private String maskedCard;  // e.g., "**** **** **** 4242"
    
    @Column(length = 50)
    private String cardBrand;   // e.g., "VISA", "MASTERCARD"
    
    @Column
    private LocalDateTime otpSentAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
