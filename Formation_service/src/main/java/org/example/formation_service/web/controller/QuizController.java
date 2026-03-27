package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.QuizAttempt;
import org.example.formation_service.service.QuizService;
import org.example.formation_service.web.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/formation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuizController {

    private final QuizService quizService;

    // ── FORMATEUR: Create quiz for a lesson ───────────────────────────────────
    @PostMapping("/lessons/{lessonId}/quiz")
    public ResponseEntity<QuizResponse> createQuiz(
            @PathVariable Long lessonId,
            @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.createQuiz(lessonId, request));
    }

    // ── ALL: Get quiz for a lesson (role-aware) ───────────────────────────────
    @GetMapping("/lessons/{lessonId}/quiz")
    public ResponseEntity<QuizResponse> getQuiz(
            @PathVariable Long lessonId,
            @RequestHeader(value = "X-User-Role", defaultValue = "APPRENANT") String role) {
        boolean isInstructor = "FORMATEUR".equals(role) || "ADMIN".equals(role);
        return ResponseEntity.ok(quizService.getQuizForLesson(lessonId, isInstructor));
    }

    // ── ALL: Check if lesson has a quiz ───────────────────────────────────────
    @GetMapping("/lessons/{lessonId}/quiz/exists")
    public ResponseEntity<Map<String, Boolean>> hasQuiz(@PathVariable Long lessonId) {
        return ResponseEntity.ok(Map.of("hasQuiz", quizService.hasQuiz(lessonId)));
    }

    // ── FORMATEUR: Update quiz ────────────────────────────────────────────────
    @PutMapping("/quizzes/{quizId}")
    public ResponseEntity<QuizResponse> updateQuiz(
            @PathVariable Long quizId,
            @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(quizId, request));
    }

    // ── FORMATEUR: Delete quiz ────────────────────────────────────────────────
    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        quizService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

    // ── APPRENANT: Submit answers ─────────────────────────────────────────────
    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<QuizResultResponse> submitQuiz(
            @PathVariable Long quizId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody QuizSubmitRequest request) {
        return ResponseEntity.ok(quizService.submitQuiz(quizId, userId, request));
    }

    // ── APPRENANT: Get my last attempt ────────────────────────────────────────
    @GetMapping("/quizzes/{quizId}/my-attempt")
    public ResponseEntity<?> getMyAttempt(
            @PathVariable Long quizId,
            @RequestHeader("X-User-Id") Long userId) {
        return quizService.getMyAttempt(quizId, userId)
            .map(attempt -> ResponseEntity.ok(Map.of(
                "score", attempt.getScore(),
                "passed", attempt.getPassed(),
                "attemptedAt", attempt.getAttemptedAt().toString()
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    // ── FORMATEUR: Quiz analytics ─────────────────────────────────────────────
    @GetMapping("/quizzes/{quizId}/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizStats(quizId));
    }
}
