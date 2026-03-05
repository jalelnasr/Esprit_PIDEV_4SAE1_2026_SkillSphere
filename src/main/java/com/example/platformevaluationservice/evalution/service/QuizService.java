package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.CreateChoiceRequest;
import com.example.platformevaluationservice.evalution.dto.CreateQuestionRequest;
import com.example.platformevaluationservice.evalution.dto.CreateQuizRequest;
import com.example.platformevaluationservice.evalution.model.*;

public interface QuizService {

    QuizResponse createQuiz(Long evaluationId, CreateQuizRequest request);

    QuestionResponse addQuestion(Long quizId, CreateQuestionRequest request);

    ChoiceResponse addChoice(Long questionId, CreateChoiceRequest request);

    QuizResponse getQuizById(Long quizId);
}
