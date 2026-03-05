package org.example.formation_service.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.formation_service.domain.enums.ResourceType;

@Data
public class LessonResourceRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotNull(message = "Type is required")
    private ResourceType type;
    
    @NotBlank(message = "URL is required")
    private String url;
    
    private Integer durationMinutes;
    
    private Long fileSizeBytes; // For PDF files
}
