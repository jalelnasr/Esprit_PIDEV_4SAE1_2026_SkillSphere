package org.example.formation_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.formation_service.domain.entity.*;
import org.example.formation_service.repository.*;
import org.example.formation_service.web.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock private QuizRepository quizRepository;
    @Mock private QuizAttemptRepository attemptRepository;
    @Mock private LessonRepository lessonRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks private QuizService quizService;

    private Lesson lesson;
    private Quiz quiz;
    private Question question;
    private AnswerOption correctOption;
    private AnswerOption wrongOption;

    @BeforeEach
    void setUp() {
        lesson = new Lesson();
        lesson.setId(1L);
        lesson.setTitle("Test Lesson");

        quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");
        quiz.setPassThreshold(70);
        quiz.setIsBlocking(false);
        quiz.setLesson(lesson);
        quiz.setQuestions(new ArrayList<>());

        correctOption = new AnswerOption();
        correctOption.setId(10L);
        correctOption.setIsCorrect(true);
        correctOption.setText("Correct Answer");

        wrongOption = new AnswerOption();
        wrongOption.setId(11L);
        wrongOption.setIsCorrect(false);
        wrongOption.setText("Wrong Answer");

        question = new Question();
        question.setId(5L);
        question.setText("What is 2+2?");
        question.setOptions(new ArrayList<>(List.of(correctOption, wrongOption)));
        question.setQuiz(quiz);

        quiz.getQuestions().add(question);
    }

    // ── createQuiz ────────────────────────────────────────────────────────────

    @Test
    void createQuiz_shouldThrow_whenQuizAlreadyExistsForLesson() {
        when(quizRepository.existsByLesson_Id(1L)).thenReturn(true);

        assertThatThrownBy(() -> quizService.createQuiz(1L, new QuizRequest()))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("already exists");
    }

    @Test
    void createQuiz_shouldThrow_whenLessonNotFound() {
        when(quizRepository.existsByLesson_Id(1L)).thenReturn(false);
        when(lessonRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizService.createQuiz(1L, new QuizRequest()))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Lesson not found");
    }

    @Test
    void createQuiz_shouldUseDefaultThreshold_whenNotProvided() {
        when(quizRepository.existsByLesson_Id(1L)).thenReturn(false);
        when(lessonRepository.findById(1L)).thenReturn(Optional.of(lesson));

        Quiz savedQuiz = new Quiz();
        savedQuiz.setId(1L);
        savedQuiz.setTitle("My Quiz");
        savedQuiz.setPassThreshold(70);
        savedQuiz.setIsBlocking(false);
        savedQuiz.setLesson(lesson);
        savedQuiz.setQuestions(new ArrayList<>());

        when(quizRepository.save(any(Quiz.class))).thenReturn(savedQuiz);

        QuizRequest request = new QuizRequest();
        request.setTitle("My Quiz");
        // passThreshold not set → should default to 70

        QuizResponse response = quizService.createQuiz(1L, request);

        assertThat(response).isNotNull();
        verify(quizRepository).save(argThat(q -> q.getPassThreshold() == 70));
    }

    // ── hasQuiz ───────────────────────────────────────────────────────────────

    @Test
    void hasQuiz_shouldReturnTrue_whenQuizExists() {
        when(quizRepository.existsByLesson_Id(1L)).thenReturn(true);
        assertThat(quizService.hasQuiz(1L)).isTrue();
    }

    @Test
    void hasQuiz_shouldReturnFalse_whenNoQuiz() {
        when(quizRepository.existsByLesson_Id(1L)).thenReturn(false);
        assertThat(quizService.hasQuiz(1L)).isFalse();
    }

    // ── submitQuiz ────────────────────────────────────────────────────────────

    @Test
    void submitQuiz_shouldThrow_whenQuizNotFound() {
        when(quizRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizService.submitQuiz(99L, 1L, new QuizSubmitRequest()))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Quiz not found");
    }

    @Test
    void submitQuiz_shouldCalculateScore100_whenAllAnswersCorrect() throws Exception {
        QuizSubmitRequest request = new QuizSubmitRequest();
        request.setEnrollmentId(1L);
        QuizSubmitRequest.AnswerDto answer = new QuizSubmitRequest.AnswerDto();
        answer.setQuestionId(5L);
        answer.setChosenOptionId(10L); // correct
        request.setAnswers(List.of(answer));

        Enrollment enrollment = new Enrollment();
        enrollment.setId(1L);

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(objectMapper.writeValueAsString(any())).thenReturn("[]");
        when(attemptRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        QuizResultResponse result = quizService.submitQuiz(1L, 1L, request);

        assertThat(result.getScore()).isEqualTo(100);
        assertThat(result.isPassed()).isTrue();
        assertThat(result.getCorrectCount()).isEqualTo(1);
    }

    @Test
    void submitQuiz_shouldCalculateScore0_whenAllAnswersWrong() throws Exception {
        QuizSubmitRequest request = new QuizSubmitRequest();
        request.setEnrollmentId(1L);
        QuizSubmitRequest.AnswerDto answer = new QuizSubmitRequest.AnswerDto();
        answer.setQuestionId(5L);
        answer.setChosenOptionId(11L); // wrong
        request.setAnswers(List.of(answer));

        Enrollment enrollment = new Enrollment();
        enrollment.setId(1L);

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(objectMapper.writeValueAsString(any())).thenReturn("[]");
        when(attemptRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        QuizResultResponse result = quizService.submitQuiz(1L, 1L, request);

        assertThat(result.getScore()).isEqualTo(0);
        assertThat(result.isPassed()).isFalse();
    }

    @Test
    void submitQuiz_shouldFail_whenScoreBelowThreshold() throws Exception {
        // threshold = 70, score = 0 → failed
        QuizSubmitRequest request = new QuizSubmitRequest();
        request.setEnrollmentId(1L);
        request.setAnswers(List.of());

        Enrollment enrollment = new Enrollment();
        enrollment.setId(1L);

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(objectMapper.writeValueAsString(any())).thenReturn("[]");
        when(attemptRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        QuizResultResponse result = quizService.submitQuiz(1L, 1L, request);

        assertThat(result.isPassed()).isFalse();
    }

    // ── getQuizStats ──────────────────────────────────────────────────────────

    @Test
    void getQuizStats_shouldReturnZeros_whenNoAttempts() {
        when(quizRepository.findAverageScore(1L)).thenReturn(null);
        when(quizRepository.countPassed(1L)).thenReturn(0L);
        when(quizRepository.countAttempts(1L)).thenReturn(0L);

        Map<String, Object> stats = quizService.getQuizStats(1L);

        assertThat(stats.get("averageScore")).isEqualTo(0L);
        assertThat(stats.get("totalAttempts")).isEqualTo(0L);
        assertThat(stats.get("passRate")).isEqualTo(0L);
    }

    @Test
    void getQuizStats_shouldCalculatePassRate_correctly() {
        when(quizRepository.findAverageScore(1L)).thenReturn(80.0);
        when(quizRepository.countPassed(1L)).thenReturn(8L);
        when(quizRepository.countAttempts(1L)).thenReturn(10L);

        Map<String, Object> stats = quizService.getQuizStats(1L);

        assertThat(stats.get("passRate")).isEqualTo(80L);
        assertThat(stats.get("averageScore")).isEqualTo(80L);
    }

    // ── deleteQuiz ────────────────────────────────────────────────────────────

    @Test
    void deleteQuiz_shouldCallRepository() {
        quizService.deleteQuiz(1L);
        verify(quizRepository).deleteById(1L);
    }

    // ── getMyAttempt ──────────────────────────────────────────────────────────

    @Test
    void getMyAttempt_shouldReturnEmpty_whenNoAttempt() {
        when(attemptRepository.findTopByQuiz_IdAndUserIdOrderByAttemptedAtDesc(1L, 1L))
            .thenReturn(Optional.empty());

        Optional<QuizAttempt> result = quizService.getMyAttempt(1L, 1L);
        assertThat(result).isEmpty();
    }
}
