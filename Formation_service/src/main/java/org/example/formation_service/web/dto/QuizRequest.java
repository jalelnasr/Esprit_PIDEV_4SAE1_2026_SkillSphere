package org.example.formation_service.web.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizRequest {
    private String title;
    private Integer passThreshold; // default 70
    private Boolean isBlocking;    // default false
    private List<QuestionRequest> questions;

    @Data
    public static class QuestionRequest {
        private String text;
        private Integer orderIndex;
        private List<OptionRequest> options;
    }

    @Data
    public static class OptionRequest {
        private String text;
        private Boolean isCorrect;
        private Integer orderIndex;
    }
}
