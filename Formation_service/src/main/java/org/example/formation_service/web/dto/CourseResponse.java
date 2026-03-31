package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;
import org.example.formation_service.domain.enums.AccessLevel;
import org.example.formation_service.domain.enums.CourseLevel;
import org.example.formation_service.domain.enums.CourseStatus;

import java.time.LocalDateTime;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private CourseLevel level;
    private AccessLevel accessLevel;
    private String language;
    private Integer durationMinutes;
    private String thumbnailUrl;
    private CourseStatus status;
    private LocalDateTime createdAt;
    private Long createdBy;
}
