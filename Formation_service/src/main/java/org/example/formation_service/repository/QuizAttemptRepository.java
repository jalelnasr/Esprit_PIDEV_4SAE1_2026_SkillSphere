package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    Optional<QuizAttempt> findTopByQuiz_IdAndUserIdOrderByAttemptedAtDesc(Long quizId, Long userId);
    boolean existsByQuiz_IdAndUserId(Long quizId, Long userId);
}
