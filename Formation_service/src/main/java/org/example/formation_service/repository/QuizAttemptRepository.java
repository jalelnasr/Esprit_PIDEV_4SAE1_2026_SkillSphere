package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    Optional<QuizAttempt> findTopByQuiz_IdAndUserIdOrderByAttemptedAtDesc(Long quizId, Long userId);

    boolean existsByQuiz_IdAndUserId(Long quizId, Long userId);

    // All attempts by a user (for student dashboard)
    List<QuizAttempt> findByUserIdOrderByAttemptedAtDesc(Long userId);

    // Best score per quiz for a user
    @Query("SELECT a FROM QuizAttempt a WHERE a.userId = :userId AND a.quiz.id = :quizId " +
           "ORDER BY a.score DESC")
    List<QuizAttempt> findByUserIdAndQuizIdOrderByScoreDesc(
        @Param("userId") Long userId, @Param("quizId") Long quizId);

    // All attempts for a quiz (for instructor analytics)
    List<QuizAttempt> findByQuiz_Id(Long quizId);

    // Count attempts by user for a quiz
    long countByQuiz_IdAndUserId(Long quizId, Long userId);
}
