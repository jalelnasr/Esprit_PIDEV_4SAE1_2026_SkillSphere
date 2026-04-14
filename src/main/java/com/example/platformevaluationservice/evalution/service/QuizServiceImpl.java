package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.*;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuizSubmissionRequest;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuizSubmissionResult;
import com.example.platformevaluationservice.evalution.model.*;
import com.example.platformevaluationservice.evalution.repository.AttemptRepository;
import com.example.platformevaluationservice.evalution.repository.ChoiceRepository;
import com.example.platformevaluationservice.evalution.repository.EvaluationRepository;
import com.example.platformevaluationservice.evalution.repository.QuestionRepository;
import com.example.platformevaluationservice.evalution.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.HashMap;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepo;
    private final QuestionRepository questionRepo;
    private final ChoiceRepository choiceRepo;
    private final EvaluationRepository evaluationRepo;
    private final AttemptRepository attemptRepo;

    @Override
    public QuizResponse createQuiz(Long evaluationId, CreateQuizRequest request) {

        Evaluation evaluation = evaluationRepo.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));

        if (evaluation.getQuiz() != null) {
            throw new RuntimeException("A quiz already exists for this evaluation");
        }

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

    @Override
    public QuizResponse getQuizById(Long quizId) {

        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        return mapToQuizResponse(quiz);
    }

    @Override
    public List<QuizResponse> getAllQuizzes() {
        return quizRepo.findAll().stream()
                .map(this::mapToQuizResponse)
                .toList();
    }

    @Override
    public List<QuizResponse> getAvailableQuizzesForApprenant() {
        return evaluationRepo.findByStatus(EvaluationStatus.PUBLISHED).stream()
                .filter(evaluation -> evaluation.getQuiz() != null)
                .map(Evaluation::getQuiz)
                .map(this::mapToQuizResponse)
                .toList();
    }

    @Override
    public ApprenantQuizSubmissionResult submitQuizForApprenant(Long quizId, Long apprenantId, ApprenantQuizSubmissionRequest request) {
        if (apprenantId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated apprenant");
        }

        Quiz quiz = quizRepo.findById(quizId)
            .orElseGet(() -> evaluationRepo.findById(quizId)
                .map(Evaluation::getQuiz)
                .orElse(null));

        if (quiz == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found");
        }

        if (quiz.getEvaluation() == null || quiz.getEvaluation().getStatus() != EvaluationStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Quiz not available");
        }

        Map<Long, Long> selectedByQuestion = new HashMap<>();
        if (request != null && request.getAnswers() != null) {
            for (ApprenantQuizSubmissionRequest.AnswerItem answer : request.getAnswers()) {
                if (answer.getQuestionId() != null && answer.getChoiceId() != null) {
                    selectedByQuestion.put(answer.getQuestionId(), answer.getChoiceId());
                }
            }
        }

        double totalPoints = 0;
        double earnedPoints = 0;

        if (quiz.getQuestions() != null) {
            for (Question question : quiz.getQuestions()) {
                int points = question.getPoints() != null ? question.getPoints() : 0;
                totalPoints += points;

                Long selectedChoiceId = selectedByQuestion.get(question.getId());
                if (selectedChoiceId == null || question.getChoices() == null) {
                    continue;
                }

                boolean isCorrect = question.getChoices().stream()
                        .anyMatch(choice -> selectedChoiceId.equals(choice.getId()) && Boolean.TRUE.equals(choice.getIsCorrect()));

                if (isCorrect) {
                    earnedPoints += points;
                }
            }
        }

        int currentAttemptScore = totalPoints <= 0 ? 0 : (int) Math.round((earnedPoints / totalPoints) * 100.0);
        int passingScore = quiz.getPassingScore() != null ? quiz.getPassingScore() : 0;

        Attempt bestAttempt = attemptRepo
                .findTopByApprenantIdAndEvaluation_IdOrderByScoreDesc(apprenantId, quiz.getEvaluation().getId())
                .orElse(null);

        int previousBest = bestAttempt != null && bestAttempt.getScore() != null
                ? (int) Math.round(bestAttempt.getScore())
                : -1;

        boolean improved = previousBest < 0 || currentAttemptScore > previousBest;
        int effectiveBestScore = Math.max(previousBest, currentAttemptScore);
        boolean alreadyPassed = previousBest >= passingScore;

        if (bestAttempt == null) {
            Attempt attempt = new Attempt();
            attempt.setApprenantId(apprenantId);
            attempt.setEvaluation(quiz.getEvaluation());
            attempt.setScore((double) currentAttemptScore);
            attempt.setPassed(currentAttemptScore >= passingScore);
            attempt.setStartedAt(Instant.now());
            attempt.setSubmittedAt(Instant.now());
            attemptRepo.save(attempt);
        } else if (improved) {
            bestAttempt.setScore((double) currentAttemptScore);
            bestAttempt.setPassed(currentAttemptScore >= passingScore);
            bestAttempt.setSubmittedAt(Instant.now());
            attemptRepo.save(bestAttempt);
        }

        ApprenantQuizSubmissionResult result = new ApprenantQuizSubmissionResult();
        result.setQuizId(quizId);
        result.setScore(effectiveBestScore);
        result.setCurrentAttemptScore(currentAttemptScore);
        result.setPassingScore(passingScore);
        result.setPassed(effectiveBestScore >= passingScore);
        result.setImproved(improved);
        result.setAlreadyPassed(alreadyPassed || effectiveBestScore >= passingScore);
        return result;
    }

    @Override
    public List<QuizResponse> getQuizzesByFormateurId(Long formateurId) {
        return evaluationRepo.findByFormateurId(formateurId).stream()
                .filter(evaluation -> evaluation.getQuiz() != null)
                .map(Evaluation::getQuiz)
                .map(this::mapToQuizResponse)
                .toList();
    }

    private QuizResponse mapToQuizResponse(Quiz quiz) {

        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setPassingScore(quiz.getPassingScore());

        if (quiz.getEvaluation() != null) {
            response.setEvaluationId(quiz.getEvaluation().getId());
        }

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