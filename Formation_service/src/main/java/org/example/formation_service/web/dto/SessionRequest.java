package org.example.formation_service.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SessionRequest {
    @NotNull(message = "Start date is required")
    private LocalDateTime startAt;
    
    @NotNull(message = "End date is required")
    private LocalDateTime endAt;
    
    private String timezone;
    private String location;
    private Integer capacity;
}
