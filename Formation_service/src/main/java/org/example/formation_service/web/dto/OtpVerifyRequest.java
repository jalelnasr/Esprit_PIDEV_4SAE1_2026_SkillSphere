package org.example.formation_service.web.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private Long paymentId;
    private String email;
    private String otpCode;
}
