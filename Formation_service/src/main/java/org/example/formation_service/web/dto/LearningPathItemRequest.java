package org.example.formation_service.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LearningPathItemRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @NotNull(message = "Order index is required")
    private Integer orderIndex;
}
