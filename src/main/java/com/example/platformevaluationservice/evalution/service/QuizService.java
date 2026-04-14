package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.*;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuizSubmissionRequest;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuizSubmissionResult;
import com.example.platformevaluationservice.evalution.dto.QuizResponse;
import com.example.platformevaluationservice.evalution.dto.*;
import java.util.List;

public interface QuizService {

    QuizResponse createQuiz(Long evaluationId, CreateQuizRequest request);

    QuestionResponse addQuestion(Long quizId, CreateQuestionRequest request);

    ChoiceResponse addChoice(Long questionId, CreateChoiceRequest request);

    QuizResponse getQuizById(Long quizId);

    List<QuizResponse> getAllQuizzes();

    List<QuizResponse> getAvailableQuizzesForApprenant();

    ApprenantQuizSubmissionResult submitQuizForApprenant(Long quizId, Long apprenantId, ApprenantQuizSubmissionRequest request);

    List<QuizResponse> getQuizzesByFormateurId(Long formateurId);
}