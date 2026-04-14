package com.example.platformevaluationservice.evalution.controller;

import com.example.platformevaluationservice.evalution.dto.QuizResponse;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantChoiceResponse;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuestionResponse;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuizResponse;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuizSubmissionRequest;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuizSubmissionResult;
import com.example.platformevaluationservice.evalution.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/apprenant/quizzes")
@RequiredArgsConstructor
public class ApprenantQuizController {

    private final QuizService quizService;

    @GetMapping
    public List<ApprenantQuizResponse> getAvailableQuizzes() {
        return quizService.getAvailableQuizzesForApprenant().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{quizId}")
    public ApprenantQuizResponse getAvailableQuizById(@PathVariable Long quizId) {
        return quizService.getAvailableQuizzesForApprenant().stream()
                .filter(quiz -> quizId.equals(quiz.getId()))
                .map(this::toResponse)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
    }

    @PostMapping("/{quizId}/submit")
    public ApprenantQuizSubmissionResult submitQuiz(
            @PathVariable Long quizId,
            Authentication authentication,
            @RequestBody ApprenantQuizSubmissionRequest request
    ) {
        Long apprenantId = extractUserId(authentication);
        return quizService.submitQuizForApprenant(quizId, apprenantId, request);
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        try {
            return Long.parseLong(String.valueOf(authentication.getPrincipal()));
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user identity");
        }
    }

    private ApprenantQuizResponse toResponse(QuizResponse quiz) {
        ApprenantQuizResponse response = new ApprenantQuizResponse();
        response.setId(quiz.getId());
        response.setEvaluationId(quiz.getEvaluationId());
        response.setQuestions(
                quiz.getQuestions().stream()
                        .map(question -> {
                            ApprenantQuestionResponse questionResponse = new ApprenantQuestionResponse();
                            questionResponse.setId(question.getId());
                            questionResponse.setText(question.getText());
                            questionResponse.setPoints(question.getPoints());
                            questionResponse.setChoices(
                                    question.getChoices().stream()
                                            .map(choice -> {
                                                ApprenantChoiceResponse choiceResponse = new ApprenantChoiceResponse();
                                                choiceResponse.setId(choice.getId());
                                                choiceResponse.setLabel(choice.getLabel());
                                                return choiceResponse;
                                            })
                                            .toList()
                            );
                            return questionResponse;
                        })
                        .toList()
        );
        return response;
    }
}
