package org.example.formation_service.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.formation_service.domain.enums.ResourceType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonResourceResponse {
    private Long id;
    private String title;
    private ResourceType type;
    private String url;
    private Integer durationMinutes;
    private Long fileSizeBytes;
    private Long lessonId;
}
