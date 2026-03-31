package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class QuizResultResponse {
    private int score;           // 0-100
    private boolean passed;
    private int passThreshold;
    private int correctCount;
    private int totalQuestions;
    private List<QuestionResult> results;

    @Data
    @Builder
    public static class QuestionResult {
        private Long questionId;
        private String questionText;
        private Long chosenOptionId;
        private Long correctOptionId;
        private boolean correct;
    }
}
