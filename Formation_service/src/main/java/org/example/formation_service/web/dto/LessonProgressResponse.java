package org.example.formation_service.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressResponse {
    private Long id;
    private Long enrollmentId;
    private Long lessonId;
    private Boolean completed;
    private LocalDateTime completedAt;
    private Integer timeSpentMinutes;
    private LocalDateTime lastAccessedAt;
}
