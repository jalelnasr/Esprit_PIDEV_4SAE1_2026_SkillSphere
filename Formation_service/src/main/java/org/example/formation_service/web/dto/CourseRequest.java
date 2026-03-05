package org.example.formation_service.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.formation_service.domain.enums.CourseLevel;

@Data
public class CourseRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Level is required")
    private CourseLevel level;
    
    private String language;
    private Integer durationMinutes;
    private String thumbnailUrl;
    
    @NotNull(message = "CreatedBy is required")
    private Long createdBy;
}
