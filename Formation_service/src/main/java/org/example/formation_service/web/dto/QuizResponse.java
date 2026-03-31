package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;
import org.example.formation_service.domain.entity.AnswerOption;
import org.example.formation_service.domain.entity.Question;
import org.example.formation_service.domain.entity.Quiz;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class QuizResponse {
    private Long id;
    private Long lessonId;
    private String title;
    private Integer passThreshold;
    private Boolean isBlocking;
    private List<QuestionResponse> questions;

    @Data
    @Builder
    public static class QuestionResponse {
        private Long id;
        private String text;
        private Integer orderIndex;
        private List<OptionResponse> options;
    }

    @Data
    @Builder
    public static class OptionResponse {
        private Long id;
        private String text;
        private Integer orderIndex;
        private Boolean isCorrect; // null for students, set for instructors
    }

    // For students — strips isCorrect
    public static QuizResponse forStudent(Quiz quiz) {
        return build(quiz, false);
    }

    // For instructors — includes isCorrect
    public static QuizResponse forInstructor(Quiz quiz) {
        return build(quiz, true);
    }

    private static QuizResponse build(Quiz quiz, boolean includeCorrect) {
        return QuizResponse.builder()
            .id(quiz.getId())
            .lessonId(quiz.getLesson().getId())
            .title(quiz.getTitle())
            .passThreshold(quiz.getPassThreshold())
            .isBlocking(quiz.getIsBlocking())
            .questions(quiz.getQuestions().stream().map(q -> buildQuestion(q, includeCorrect)).collect(Collectors.toList()))
            .build();
    }

    private static QuestionResponse buildQuestion(Question q, boolean includeCorrect) {
        return QuestionResponse.builder()
            .id(q.getId())
            .text(q.getText())
            .orderIndex(q.getOrderIndex())
            .options(q.getOptions().stream().map(o -> buildOption(o, includeCorrect)).collect(Collectors.toList()))
            .build();
    }

    private static OptionResponse buildOption(AnswerOption o, boolean includeCorrect) {
        return OptionResponse.builder()
            .id(o.getId())
            .text(o.getText())
            .orderIndex(o.getOrderIndex())
            .isCorrect(includeCorrect ? o.getIsCorrect() : null)
            .build();
    }
}
