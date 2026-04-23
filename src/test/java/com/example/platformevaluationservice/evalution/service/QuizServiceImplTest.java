package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.ChoiceRequest;
import com.example.platformevaluationservice.evalution.dto.CreateQuizRequest;
import com.example.platformevaluationservice.evalution.dto.QuestionRequest;
import com.example.platformevaluationservice.evalution.dto.QuizResponse;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuizSubmissionRequest;
import com.example.platformevaluationservice.evalution.dto.apprenant.ApprenantQuizSubmissionResult;
import com.example.platformevaluationservice.evalution.model.Attempt;
import com.example.platformevaluationservice.evalution.model.Choice;
import com.example.platformevaluationservice.evalution.model.Evaluation;
import com.example.platformevaluationservice.evalution.model.EvaluationStatus;
import com.example.platformevaluationservice.evalution.model.Question;
import com.example.platformevaluationservice.evalution.model.Quiz;
import com.example.platformevaluationservice.evalution.repository.AttemptRepository;
import com.example.platformevaluationservice.evalution.repository.ChoiceRepository;
import com.example.platformevaluationservice.evalution.repository.EvaluationRepository;
import com.example.platformevaluationservice.evalution.repository.QuestionRepository;
import com.example.platformevaluationservice.evalution.repository.QuizRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizServiceImplTest {

    @Mock
    private QuizRepository quizRepo;

    @Mock
    private QuestionRepository questionRepo;

    @Mock
    private ChoiceRepository choiceRepo;

    @Mock
    private EvaluationRepository evaluationRepo;

    @Mock
    private AttemptRepository attemptRepo;

    @InjectMocks
    private QuizServiceImpl service;

    @Test
    void createQuizShouldPersistAndMapResponse() {
        Evaluation evaluation = new Evaluation();
        evaluation.setId(10L);

        CreateQuizRequest request = new CreateQuizRequest();
        request.setPassingScore(70);

        QuestionRequest questionRequest = new QuestionRequest();
        questionRequest.setText("What is Angular?");
        questionRequest.setPoints(10);

        ChoiceRequest choiceRequest = new ChoiceRequest();
        choiceRequest.setLabel("A framework");
        choiceRequest.setIsCorrect(true);
        questionRequest.setChoices(List.of(choiceRequest));
        request.setQuestions(List.of(questionRequest));

        when(evaluationRepo.findById(10L)).thenReturn(Optional.of(evaluation));
        when(quizRepo.save(any(Quiz.class))).thenAnswer(invocation -> {
            Quiz quiz = invocation.getArgument(0);
            quiz.setId(99L);
            if (quiz.getQuestions() != null) {
                long questionId = 501L;
                long choiceId = 9001L;
                for (Question question : quiz.getQuestions()) {
                    question.setId(questionId++);
                    if (question.getChoices() != null) {
                        for (Choice choice : question.getChoices()) {
                            choice.setId(choiceId++);
                        }
                    }
                }
            }
            return quiz;
        });

        QuizResponse response = service.createQuiz(10L, request);

        assertEquals(99L, response.getId());
        assertEquals(10L, response.getEvaluationId());
        assertEquals(70, response.getPassingScore());
        assertEquals(1, response.getQuestions().size());
        assertEquals("What is Angular?", response.getQuestions().get(0).getText());
        assertEquals(1, response.getQuestions().get(0).getChoices().size());
    }

    @Test
    void getQuizzesByFormateurIdShouldFilterEvaluationsWithoutQuiz() {
        Evaluation withQuiz = new Evaluation();
        withQuiz.setId(1L);
        Quiz quiz = new Quiz();
        quiz.setId(11L);
        quiz.setPassingScore(80);
        quiz.setEvaluation(withQuiz);
        withQuiz.setQuiz(quiz);

        Evaluation withoutQuiz = new Evaluation();
        withoutQuiz.setId(2L);

        when(evaluationRepo.findByFormateurId(7L)).thenReturn(List.of(withQuiz, withoutQuiz));

        List<QuizResponse> result = service.getQuizzesByFormateurId(7L);

        assertEquals(1, result.size());
        assertEquals(11L, result.get(0).getId());
        assertEquals(1L, result.get(0).getEvaluationId());
    }

    @Test
    void submitQuizForApprenantShouldComputeScoreAndSaveFirstAttempt() {
        Evaluation evaluation = new Evaluation();
        evaluation.setId(55L);
        evaluation.setStatus(EvaluationStatus.PUBLISHED);

        Quiz quiz = new Quiz();
        quiz.setId(8L);
        quiz.setPassingScore(70);
        quiz.setEvaluation(evaluation);

        Question question = new Question();
        question.setId(101L);
        question.setText("Question");
        question.setPoints(10);
        question.setQuiz(quiz);

        Choice correctChoice = new Choice();
        correctChoice.setId(201L);
        correctChoice.setLabel("Correct");
        correctChoice.setIsCorrect(true);
        correctChoice.setQuestion(question);

        Choice wrongChoice = new Choice();
        wrongChoice.setId(202L);
        wrongChoice.setLabel("Wrong");
        wrongChoice.setIsCorrect(false);
        wrongChoice.setQuestion(question);

        question.setChoices(List.of(correctChoice, wrongChoice));
        quiz.setQuestions(List.of(question));
        evaluation.setQuiz(quiz);

        ApprenantQuizSubmissionRequest request = new ApprenantQuizSubmissionRequest();
        ApprenantQuizSubmissionRequest.AnswerItem answer = new ApprenantQuizSubmissionRequest.AnswerItem();
        answer.setQuestionId(101L);
        answer.setChoiceId(201L);
        request.setAnswers(List.of(answer));

        when(quizRepo.findById(8L)).thenReturn(Optional.of(quiz));
        when(attemptRepo.findTopByApprenantIdAndEvaluation_IdOrderByScoreDesc(3L, 55L)).thenReturn(Optional.empty());
        when(attemptRepo.save(any(Attempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApprenantQuizSubmissionResult result = service.submitQuizForApprenant(8L, 3L, request);

        assertEquals(8L, result.getQuizId());
        assertEquals(100, result.getScore());
        assertEquals(100, result.getCurrentAttemptScore());
        assertTrue(result.getPassed());
        assertTrue(result.getImproved());
        assertTrue(result.getAlreadyPassed());
        verify(attemptRepo).save(any(Attempt.class));
    }

    @Test
    void submitQuizForApprenantShouldRejectMissingApprenantId() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.submitQuizForApprenant(8L, null, new ApprenantQuizSubmissionRequest())
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }
}