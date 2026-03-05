package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.*;
import com.example.platformevaluationservice.evalution.model.*;
import com.example.platformevaluationservice.evalution.repository.ChoiceRepository;
import com.example.platformevaluationservice.evalution.repository.EvaluationRepository;
import com.example.platformevaluationservice.evalution.repository.QuestionRepository;
import com.example.platformevaluationservice.evalution.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepo;
    private final QuestionRepository questionRepo;
    private final ChoiceRepository choiceRepo;
    private final EvaluationRepository evaluationRepo;

    // ===============================
    // CREATE QUIZ
    // ===============================
    @Override
    public QuizResponse createQuiz(Long evaluationId, CreateQuizRequest request) {

        Evaluation evaluation = evaluationRepo.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));

        Quiz quiz = new Quiz();
        quiz.setPassingScore(request.getPassingScore());
        quiz.setEvaluation(evaluation);

        List<Question> questions = new ArrayList<>();

        if (request.getQuestions() != null) {

            for (QuestionRequest q : request.getQuestions()) {

                Question question = new Question();
                question.setText(q.getText());
                question.setPoints(q.getPoints());
                question.setQuiz(quiz);

                List<Choice> choices = new ArrayList<>();

                if (q.getChoices() != null) {

                    for (ChoiceRequest c : q.getChoices()) {

                        Choice choice = new Choice();
                        choice.setLabel(c.getLabel());
                        choice.setIsCorrect(c.getIsCorrect());
                        choice.setQuestion(question);

                        choices.add(choice);
                    }
                }

                question.setChoices(choices);
                questions.add(question);
            }
        }

        quiz.setQuestions(questions);

        quiz = quizRepo.save(quiz);

        return mapToQuizResponse(quiz);
    }

    // ===============================
    // ADD QUESTION
    // ===============================
    @Override
    public QuestionResponse addQuestion(Long quizId, CreateQuestionRequest request) {

        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Question question = new Question();
        question.setText(request.getText());
        question.setPoints(request.getPoints());
        question.setQuiz(quiz);

        question = questionRepo.save(question);

        return mapToQuestionResponse(question);
    }

    // ===============================
    // ADD CHOICE
    // ===============================
    @Override
    public ChoiceResponse addChoice(Long questionId, CreateChoiceRequest request) {

        Question question = questionRepo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Choice choice = new Choice();
        choice.setLabel(request.getLabel());
        choice.setIsCorrect(request.getIsCorrect());
        choice.setQuestion(question);

        choice = choiceRepo.save(choice);

        return mapToChoiceResponse(choice);
    }

    // ===============================
    // GET QUIZ WITH QUESTIONS + CHOICES
    // ===============================
    @Override
    public QuizResponse getQuizById(Long quizId) {

        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        return mapToQuizResponse(quiz);
    }

    // ===============================
    // MAPPING METHODS
    // ===============================

    private QuizResponse mapToQuizResponse(Quiz quiz) {

        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setPassingScore(quiz.getPassingScore());
        response.setEvaluationId(quiz.getEvaluation().getId());

        if (quiz.getQuestions() != null) {
            response.setQuestions(
                    quiz.getQuestions()
                            .stream()
                            .map(this::mapToQuestionResponse)
                            .toList()
            );
        }

        return response;
    }

    private QuestionResponse mapToQuestionResponse(Question question) {

        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setText(question.getText());
        response.setPoints(question.getPoints());

        if (question.getChoices() != null) {
            response.setChoices(
                    question.getChoices()
                            .stream()
                            .map(this::mapToChoiceResponse)
                            .toList()
            );
        }

        return response;
    }

    private ChoiceResponse mapToChoiceResponse(Choice choice) {

        ChoiceResponse response = new ChoiceResponse();
        response.setId(choice.getId());
        response.setLabel(choice.getLabel());
        response.setIsCorrect(choice.getIsCorrect());

        return response;
    }
}