package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LearningPathRoadmapResponse {
    private Long learningPathId;
    private String title;
    private List<CourseRoadmapItem> courses;
    
    @Data
    @Builder
    public static class CourseRoadmapItem {
        private Long courseId;
        private String courseTitle;
        private Integer orderIndex;
        private Boolean isLocked;
        private Boolean isCompleted;
    }
}
