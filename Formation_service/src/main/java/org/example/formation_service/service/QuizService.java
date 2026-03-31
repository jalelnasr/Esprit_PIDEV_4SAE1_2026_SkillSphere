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

    // ── APPRENANT: All quiz summaries across enrolled courses ─────────────────
    public List<StudentQuizSummary> getStudentQuizSummaries(Long userId) {
        // Get all attempts by this user
        List<QuizAttempt> allAttempts = attemptRepository.findByUserIdOrderByAttemptedAtDesc(userId);

        // Group by quizId: best score per quiz
        Map<Long, QuizAttempt> bestAttemptByQuiz = new LinkedHashMap<>();
        Map<Long, Long> attemptCountByQuiz = new HashMap<>();

        for (QuizAttempt attempt : allAttempts) {
            Long quizId = attempt.getQuiz().getId();
            attemptCountByQuiz.merge(quizId, 1L, Long::sum);
            bestAttemptByQuiz.merge(quizId, attempt,
                (existing, newAttempt) -> existing.getScore() >= newAttempt.getScore() ? existing : newAttempt);
        }

        // Build summaries
        List<StudentQuizSummary> summaries = new ArrayList<>();
        for (Map.Entry<Long, QuizAttempt> entry : bestAttemptByQuiz.entrySet()) {
            QuizAttempt best = entry.getValue();
            Quiz quiz = best.getQuiz();
            Lesson lesson = quiz.getLesson();
            org.example.formation_service.domain.entity.Course course = lesson.getCourse();

            String status = best.getPassed() ? "PASSED" : "FAILED";

            summaries.add(StudentQuizSummary.builder()
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .lessonId(lesson.getId())
                .lessonTitle(lesson.getTitle())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .bestScore(best.getScore())
                .totalQuestions(quiz.getQuestions().size())
                .passThreshold(quiz.getPassThreshold())
                .passed(best.getPassed())
                .status(status)
                .attemptCount(attemptCountByQuiz.getOrDefault(quiz.getId(), 0L))
                .lastAttemptAt(best.getAttemptedAt())
                .build());
        }

        return summaries;
    }

    // ── FORMATEUR: Full analytics for a quiz (with weakest questions) ─────────
    public QuizAnalyticsResponse getQuizAnalytics(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));

        List<QuizAttempt> attempts = attemptRepository.findByQuiz_Id(quizId);
        int total = attempts.size();

        if (total == 0) {
            return QuizAnalyticsResponse.builder()
                .quizId(quizId)
                .quizTitle(quiz.getTitle())
                .lessonTitle(quiz.getLesson().getTitle())
                .totalAttempts(0)
                .averageScore(0)
                .passRate(0)
                .passedCount(0)
                .weakestQuestions(new ArrayList<>())
                .build();
        }

        int totalScore = attempts.stream().mapToInt(QuizAttempt::getScore).sum();
        long passedCount = attempts.stream().filter(QuizAttempt::getPassed).count();
        int avgScore = totalScore / total;
        int passRate = (int) Math.round((passedCount * 100.0) / total);

        // Parse answers_json to count wrong answers per question
        Map<Long, int[]> questionStats = new LinkedHashMap<>(); // questionId -> [wrongCount, totalAnswered]
        for (Question q : quiz.getQuestions()) {
            questionStats.put(q.getId(), new int[]{0, 0});
        }

        // Build correct answer map
        Map<Long, Long> correctAnswers = new HashMap<>();
        for (Question q : quiz.getQuestions()) {
            q.getOptions().stream()
                .filter(AnswerOption::getIsCorrect)
                .findFirst()
                .ifPresent(opt -> correctAnswers.put(q.getId(), opt.getId()));
        }

        for (QuizAttempt attempt : attempts) {
            try {
                List<Map<String, Object>> answers = objectMapper.readValue(
                    attempt.getAnswersJson(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
                );
                for (Map<String, Object> answer : answers) {
                    Long questionId = Long.valueOf(answer.get("questionId").toString());
                    Long chosenId = answer.get("chosenOptionId") != null
                        ? Long.valueOf(answer.get("chosenOptionId").toString()) : null;

                    if (questionStats.containsKey(questionId)) {
                        questionStats.get(questionId)[1]++; // totalAnswered
                        Long correct = correctAnswers.get(questionId);
                        if (chosenId == null || !chosenId.equals(correct)) {
                            questionStats.get(questionId)[0]++; // wrongCount
                        }
                    }
                }
            } catch (Exception e) {
                // skip malformed JSON
            }
        }

        // Build weakest questions list
        Map<Long, String> questionTexts = new HashMap<>();
        for (Question q : quiz.getQuestions()) {
            questionTexts.put(q.getId(), q.getText());
        }

        List<QuizAnalyticsResponse.WeakQuestion> weakQuestions = questionStats.entrySet().stream()
            .filter(e -> e.getValue()[1] > 0)
            .map(e -> {
                int wrong = e.getValue()[0];
                int answered = e.getValue()[1];
                return QuizAnalyticsResponse.WeakQuestion.builder()
                    .questionId(e.getKey())
                    .questionText(questionTexts.getOrDefault(e.getKey(), ""))
                    .wrongCount(wrong)
                    .totalAnswered(answered)
                    .wrongPercent(answered > 0 ? (wrong * 100 / answered) : 0)
                    .build();
            })
            .sorted((a, b) -> b.getWrongPercent() - a.getWrongPercent())
            .collect(Collectors.toList());

        return QuizAnalyticsResponse.builder()
            .quizId(quizId)
            .quizTitle(quiz.getTitle())
            .lessonTitle(quiz.getLesson().getTitle())
            .totalAttempts(total)
            .averageScore(avgScore)
            .passRate(passRate)
            .passedCount((int) passedCount)
            .weakestQuestions(weakQuestions)
            .build();
    }
}
