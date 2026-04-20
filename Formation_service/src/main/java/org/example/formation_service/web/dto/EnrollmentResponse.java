package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;
import org.example.formation_service.domain.enums.EnrollmentStatus;

import java.time.LocalDateTime;

@Data
@Builder
public class EnrollmentResponse {
    private Long id;
    private Long userId;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime inscriptionDate;
    private EnrollmentStatus status;
    private Integer completionPercent;
    private LocalDateTime completedAt;
}
