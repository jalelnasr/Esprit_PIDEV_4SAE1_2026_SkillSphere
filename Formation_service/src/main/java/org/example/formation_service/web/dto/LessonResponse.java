package org.example.formation_service.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonResponse {
    private Long id;
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer durationMinutes;
    private Long courseId;
    private List<LessonResourceResponse> resources;
}
