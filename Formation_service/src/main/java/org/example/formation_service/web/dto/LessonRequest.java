package org.example.formation_service.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LessonRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    private String description; // Optional description field
    
    @NotNull(message = "Order index is required")
    private Integer orderIndex;
    
    private Integer durationMinutes;
}
