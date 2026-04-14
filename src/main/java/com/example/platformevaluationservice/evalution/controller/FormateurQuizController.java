package com.example.platformevaluationservice.evalution.controller;

import com.example.platformevaluationservice.evalution.dto.CreateChoiceRequest;
import com.example.platformevaluationservice.evalution.dto.CreateQuestionRequest;
import com.example.platformevaluationservice.evalution.dto.CreateQuizRequest;
import com.example.platformevaluationservice.evalution.model.*;
import com.example.platformevaluationservice.evalution.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.platformevaluationservice.evalution.dto.QuizResponse;
import java.util.List;
import com.example.platformevaluationservice.evalution.dto.*;

@RestController
@RequestMapping("/api/formateur/quizzes")
@RequiredArgsConstructor
public class FormateurQuizController {
    @GetMapping("/quizzes")
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }
    private final QuizService quizService;

    // =====================================================
    // CREATE QUIZ
    // POST /api/formateur/quizzes/{evaluationId}
    // =====================================================
    @PostMapping("/{evaluationId}")
    public ResponseEntity<QuizResponse> createQuiz(
            @PathVariable Long evaluationId,
            @RequestBody CreateQuizRequest request) {

        QuizResponse response = quizService.createQuiz(evaluationId, request);
        return ResponseEntity.ok(response);
    }

    // =====================================================
    // ADD QUESTION TO QUIZ
    // POST /api/formateur/quizzes/{quizId}/questions
    // =====================================================
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<QuestionResponse> addQuestion(
            @PathVariable Long quizId,
            @RequestBody CreateQuestionRequest request) {

        QuestionResponse response = quizService.addQuestion(quizId, request);
        return ResponseEntity.ok(response);
    }

    // =====================================================
    // ADD CHOICE TO QUESTION
    // POST /api/formateur/quizzes/questions/{questionId}/choices
    // =====================================================
    @PostMapping("/questions/{questionId}/choices")
    public ResponseEntity<ChoiceResponse> addChoice(
            @PathVariable Long questionId,
            @RequestBody CreateChoiceRequest request) {

        ChoiceResponse response = quizService.addChoice(questionId, request);
        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET QUIZ WITH QUESTIONS + CHOICES
    // GET /api/formateur/quizzes/{quizId}
    // =====================================================
    @GetMapping("/{quizId}")
    public ResponseEntity<QuizResponse> getQuizById(
            @PathVariable Long quizId) {

        QuizResponse response = quizService.getQuizById(quizId);
        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET ALL QUIZZES FOR A FORMATEUR
    // GET /api/formateur/quizzes/formateur/{formateurId}
    // =====================================================
    @GetMapping("/formateur/{formateurId}")
    public ResponseEntity<List<QuizResponse>> getQuizzesByFormateur(
            @PathVariable Long formateurId) {

        List<QuizResponse> response = quizService.getQuizzesByFormateurId(formateurId);
        return ResponseEntity.ok(response);
    }

}