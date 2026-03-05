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
public class InstructorStatisticsResponse {
    
    // Overview statistics
    private Long totalFormations;
    private Long totalSessions;
    private Long totalStudents;
    private Double averageCompletionRate;
    
    // Enrollment trends (last 6 months)
    private List<EnrollmentTrendData> enrollmentTrends;
    
    // Top formations by enrollment
    private List<TopFormationData> topFormations;
    
    // Recent activity
    private List<RecentActivityData> recentActivities;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentTrendData {
        private String month; // e.g., "Jan 2026"
        private Long enrollmentCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopFormationData {
        private Long courseId;
        private String courseTitle;
        private Long enrollmentCount;
        private Double completionRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityData {
        private String type; // "ENROLLMENT", "COMPLETION", "SESSION_CREATED"
        private String description;
        private String timestamp;
        private Long relatedCourseId;
        private String relatedCourseTitle;
    }
}
