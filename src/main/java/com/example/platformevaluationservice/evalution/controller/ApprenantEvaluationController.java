package com.example.platformevaluationservice.evalution.controller;

import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantEvaluationResponse;
import com.example.platformevaluationservice.evalution.model.Attempt;
import com.example.platformevaluationservice.evalution.model.Certificate;
import com.example.platformevaluationservice.evalution.model.Evaluation;
import com.example.platformevaluationservice.evalution.repository.AttemptRepository;
import com.example.platformevaluationservice.evalution.repository.CertificateRepository;
import com.example.platformevaluationservice.evalution.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/apprenant/evaluations")
@RequiredArgsConstructor
public class ApprenantEvaluationController {

    private final EvaluationService evaluationService;
    private final AttemptRepository attemptRepository;
    private final CertificateRepository certificateRepository;

    @GetMapping
    public List<ApprenantEvaluationResponse> getPublishedEvaluations(Authentication authentication) {
        Long apprenantId = extractUserId(authentication);
        List<Evaluation> evaluations = evaluationService.getPublishedForApprenant();
        List<Long> evaluationIds = evaluations.stream().map(Evaluation::getId).toList();

        Map<Long, Attempt> bestAttemptsByEvaluation = new HashMap<>();
        attemptRepository.findByApprenantIdAndEvaluation_IdIn(apprenantId, evaluationIds)
                .forEach(attempt -> {
                    Long evaluationId = attempt.getEvaluation() != null ? attempt.getEvaluation().getId() : null;
                    if (evaluationId == null) {
                        return;
                    }
                    Attempt existing = bestAttemptsByEvaluation.get(evaluationId);
                    double existingScore = existing != null && existing.getScore() != null ? existing.getScore() : -1;
                    double candidateScore = attempt.getScore() != null ? attempt.getScore() : -1;
                    if (existing == null || candidateScore > existingScore) {
                        bestAttemptsByEvaluation.put(evaluationId, attempt);
                    }
                });

            Map<Long, Certificate> certificatesByEvaluation = new HashMap<>();
            evaluationIds.forEach(evaluationId -> certificateRepository
                .findByApprenantIdAndEvaluationId(apprenantId, evaluationId)
                .ifPresent(certificate -> certificatesByEvaluation.put(evaluationId, certificate)));

        return evaluations.stream()
                .map(evaluation -> toResponse(
                    evaluation,
                    bestAttemptsByEvaluation.get(evaluation.getId()),
                    certificatesByEvaluation.get(evaluation.getId())
                ))
                .toList();
    }

            private ApprenantEvaluationResponse toResponse(Evaluation evaluation, Attempt bestAttempt, Certificate certificate) {
        ApprenantEvaluationResponse response = new ApprenantEvaluationResponse();
        response.setId(evaluation.getId());
        response.setTitle(evaluation.getTitle());
        response.setDescription(evaluation.getDescription());
        response.setStatus(evaluation.getStatus() != null ? evaluation.getStatus().name() : null);

        if (bestAttempt != null) {
            int bestScore = bestAttempt.getScore() != null ? (int) Math.round(bestAttempt.getScore()) : 0;
            response.setAttempted(true);
            response.setBestScore(bestScore);
            response.setPassed(Boolean.TRUE.equals(bestAttempt.getPassed()));
        } else {
            response.setAttempted(false);
            response.setBestScore(null);
            response.setPassed(false);
        }

        if (certificate != null) {
            response.setCertificateStatus(certificate.getStatus());
        }

        if (evaluation.getQuiz() != null) {
            ApprenantEvaluationResponse.ApprenantQuizSummary quizSummary = new ApprenantEvaluationResponse.ApprenantQuizSummary();
            quizSummary.setId(evaluation.getQuiz().getId());
            response.setQuiz(quizSummary);
        }

        return response;
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
}
