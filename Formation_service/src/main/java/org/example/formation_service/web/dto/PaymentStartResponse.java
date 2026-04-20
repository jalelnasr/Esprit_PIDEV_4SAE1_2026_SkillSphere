package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentStartResponse {
    private Long paymentId;
    private Long subscriptionId;
    private String email;
    private String message;
    private boolean otpSent;
}
