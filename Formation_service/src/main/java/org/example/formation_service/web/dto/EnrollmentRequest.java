package org.example.formation_service.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollmentRequest {
    @NotNull(message = "User ID is required")
    private Long userId;
}
