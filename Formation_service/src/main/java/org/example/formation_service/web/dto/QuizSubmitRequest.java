package org.example.formation_service.web.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizSubmitRequest {
    private Long enrollmentId;
    private List<AnswerDto> answers;

    @Data
    public static class AnswerDto {
        private Long questionId;
        private Long chosenOptionId;
    }
}
