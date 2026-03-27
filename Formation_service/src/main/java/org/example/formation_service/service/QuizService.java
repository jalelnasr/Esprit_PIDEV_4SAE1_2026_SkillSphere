package org.example.formation_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.*;
import org.example.formation_service.repository.*;
import org.example.formation_service.web.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ObjectMapper objectMapper;

    // ── FORMATEUR: Create quiz for a lesson ───────────────────────────────────
    @Transactional
    public QuizResponse createQuiz(Long lessonId, QuizRequest request) {
        if (quizRepository.existsByLesson_Id(lessonId)) {
            throw new RuntimeException("A quiz already exists for this lesson");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));

        Quiz quiz = Quiz.builder()
            .lesson(lesson)
            .title(request.getTitle())
            .passThreshold(request.getPassThreshold() != null ? request.getPassThreshold() : 70)
            .isBlocking(request.getIsBlocking() != null ? request.getIsBlocking() : false)
            .build();

        if (request.getQuestions() != null) {
            for (QuizRequest.QuestionRequest qr : request.getQuestions()) {
                Question question = Question.builder()
                    .quiz(quiz)
                    .text(qr.getText())
                    .orderIndex(qr.getOrderIndex() != null ? qr.getOrderIndex() : 0)
                    .build();

                if (qr.getOptions() != null) {
                    for (QuizRequest.OptionRequest or : qr.getOptions()) {
                        AnswerOption option = AnswerOption.builder()
                            .question(question)
                            .text(or.getText())
                            .isCorrect(or.getIsCorrect() != null ? or.getIsCorrect() : false)
                            .orderIndex(or.getOrderIndex() != null ? or.getOrderIndex() : 0)
                            .build();
                        question.getOptions().add(option);
                    }
                }
                quiz.getQuestions().add(question);
            }
        }

        quiz = quizRepository.save(quiz);
        return QuizResponse.forInstructor(quiz);
    }

    // ── FORMATEUR: Update quiz ────────────────────────────────────────────────
    @Transactional
    public QuizResponse updateQuiz(Long quizId, QuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));

        if (request.getTitle() != null) quiz.setTitle(request.getTitle());
        if (request.getPassThreshold() != null) quiz.setPassThreshold(request.getPassThreshold());
        if (request.getIsBlocking() != null) quiz.setIsBlocking(request.getIsBlocking());

        if (request.getQuestions() != null) {
            quiz.getQuestions().clear();
            for (QuizRequest.QuestionRequest qr : request.getQuestions()) {
                Question question = Question.builder()
                    .quiz(quiz)
                    .text(qr.getText())
                    .orderIndex(qr.getOrderIndex() != null ? qr.getOrderIndex() : 0)
                    .build();

                if (qr.getOptions() != null) {
                    for (QuizRequest.OptionRequest or : qr.getOptions()) {
                        AnswerOption option = AnswerOption.builder()
                            .question(question)
                            .text(or.getText())
                            .isCorrect(or.getIsCorrect() != null ? or.getIsCorrect() : false)
                            .orderIndex(or.getOrderIndex() != null ? or.getOrderIndex() : 0)
                            .build();
                        question.getOptions().add(option);
                    }
                }
                quiz.getQuestions().add(question);
            }
        }

        quiz = quizRepository.save(quiz);
        return QuizResponse.forInstructor(quiz);
    }

    // ── FORMATEUR: Delete quiz ────────────────────────────────────────────────
    @Transactional
    public void deleteQuiz(Long quizId) {
        quizRepository.deleteById(quizId);
    }

    // ── ALL: Get quiz for a lesson ────────────────────────────────────────────
    public QuizResponse getQuizForLesson(Long lessonId, boolean isInstructor) {
        Quiz quiz = quizRepository.findByLesson_Id(lessonId)
            .orElseThrow(() -> new RuntimeException("No quiz for lesson: " + lessonId));
        return isInstructor ? QuizResponse.forInstructor(quiz) : QuizResponse.forStudent(quiz);
    }

    public boolean hasQuiz(Long lessonId) {
        return quizRepository.existsByLesson_Id(lessonId);
    }

    // ── APPRENANT: Submit answers ─────────────────────────────────────────────
    @Transactional
    public QuizResultResponse submitQuiz(Long quizId, Long userId, QuizSubmitRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));

        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Build a map: questionId -> correct optionId
        Map<Long, Long> correctAnswers = new HashMap<>();
        for (Question q : quiz.getQuestions()) {
            q.getOptions().stream()
                .filter(AnswerOption::getIsCorrect)
                .findFirst()
                .ifPresent(opt -> correctAnswers.put(q.getId(), opt.getId()));
        }

        // Build a map: questionId -> chosen optionId from submission
        Map<Long, Long> chosenAnswers = new HashMap<>();
        if (request.getAnswers() != null) {
            for (QuizSubmitRequest.AnswerDto a : request.getAnswers()) {
                chosenAnswers.put(a.getQuestionId(), a.getChosenOptionId());
            }
        }

        // Calculate score
        int total = quiz.getQuestions().size();
        int correct = 0;
        List<QuizResultResponse.QuestionResult> results = new ArrayList<>();

        for (Question q : quiz.getQuestions()) {
            Long chosen = chosenAnswers.get(q.getId());
            Long correctOpt = correctAnswers.get(q.getId());
            boolean isCorrect = chosen != null && chosen.equals(correctOpt);
            if (isCorrect) correct++;

            results.add(QuizResultResponse.QuestionResult.builder()
                .questionId(q.getId())
                .questionText(q.getText())
                .chosenOptionId(chosen)
                .correctOptionId(correctOpt)
                .correct(isCorrect)
                .build());
        }

        int score = total > 0 ? (correct * 100 / total) : 0;
        boolean passed = score >= quiz.getPassThreshold();

        // Serialize answers snapshot
        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(request.getAnswers());
        } catch (Exception e) {
            answersJson = "[]";
        }

        // Save attempt (allow retakes — keep latest)
        QuizAttempt attempt = QuizAttempt.builder()
            .quiz(quiz)
            .userId(userId)
            .enrollment(enrollment)
            .score(score)
            .passed(passed)
            .answersJson(answersJson)
            .build();
        attemptRepository.save(attempt);

        return QuizResultResponse.builder()
            .score(score)
            .passed(passed)
            .passThreshold(quiz.getPassThreshold())
            .correctCount(correct)
            .totalQuestions(total)
            .results(results)
            .build();
    }

    // ── APPRENANT: Get my last attempt ────────────────────────────────────────
    public Optional<QuizAttempt> getMyAttempt(Long quizId, Long userId) {
        return attemptRepository.findTopByQuiz_IdAndUserIdOrderByAttemptedAtDesc(quizId, userId);
    }

    // ── FORMATEUR: Quiz stats ─────────────────────────────────────────────────
    public Map<String, Object> getQuizStats(Long quizId) {
        Double avg = quizRepository.findAverageScore(quizId);
        Long passed = quizRepository.countPassed(quizId);
        Long total = quizRepository.countAttempts(quizId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("averageScore", avg != null ? Math.round(avg) : 0);
        stats.put("totalAttempts", total);
        stats.put("passedCount", passed);
        stats.put("passRate", total > 0 ? Math.round((passed * 100.0) / total) : 0);
        return stats;
    }
}
