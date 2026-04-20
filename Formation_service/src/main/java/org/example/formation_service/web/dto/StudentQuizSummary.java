package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StudentQuizSummary {
    private Long quizId;
    private String quizTitle;
    private Long lessonId;
    private String lessonTitle;
    private Long courseId;
    private String courseTitle;
    private Integer bestScore;        // null if never attempted
    private Integer totalQuestions;
    private Integer passThreshold;
    private Boolean passed;           // null if never attempted
    private String status;            // "PASSED", "FAILED", "NOT_TAKEN"
    private long attemptCount;
    private LocalDateTime lastAttemptAt;
}
