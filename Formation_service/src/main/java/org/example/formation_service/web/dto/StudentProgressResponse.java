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
public class StudentProgressResponse {
    
    private Long enrollmentId;
    private Long userId;
    private String userName; // Will be fetched from User Service if needed
    private String userEmail;
    
    private Long courseId;
    private String courseTitle;
    
    private Integer completionPercent;
    private String status; // ACTIVE, COMPLETED, CANCELLED
    
    private LocalDateTime enrolledAt;
    private LocalDateTime lastActivity;
    private LocalDateTime completedAt;
    
    private Integer totalLessons;
    private Integer completedLessons;
    private Integer timeSpentMinutes;
}
