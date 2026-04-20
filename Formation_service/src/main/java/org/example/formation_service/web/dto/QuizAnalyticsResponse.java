package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuizAnalyticsResponse {
    private Long quizId;
    private String quizTitle;
    private String lessonTitle;
    private int totalAttempts;
    private int averageScore;
    private int passRate;
    private int passedCount;
    private List<WeakQuestion> weakestQuestions; // sorted by wrong count desc

    @Data
    @Builder
    public static class WeakQuestion {
        private Long questionId;
        private String questionText;
        private int wrongCount;
        private int totalAnswered;
        private int wrongPercent;
    }
}
