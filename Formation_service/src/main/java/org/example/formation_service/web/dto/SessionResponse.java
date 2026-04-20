package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;
import org.example.formation_service.domain.enums.SessionStatus;

import java.time.LocalDateTime;

@Data
@Builder
public class SessionResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String timezone;
    private String location;
    private Integer capacity;
    private Integer enrolledCount;
    private SessionStatus status;
}
