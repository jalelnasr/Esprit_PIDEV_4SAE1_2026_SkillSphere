package org.example.formation_service.web.dto;

import lombok.Data;

@Data
public class PaymentStartRequest {
    private String planSlug;
    private String email;
    private String cardNumber;      // Will be masked (only last 4 digits stored)
    private String cardExpiry;      // MM/YY format
    private String cardCvv;         // Not stored
    private String cardHolderName;
}
