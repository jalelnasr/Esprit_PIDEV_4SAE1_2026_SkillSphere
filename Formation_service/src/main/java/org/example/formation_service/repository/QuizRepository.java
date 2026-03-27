package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByLesson_Id(Long lessonId);
    boolean existsByLesson_Id(Long lessonId);

    @Query("SELECT AVG(a.score) FROM QuizAttempt a WHERE a.quiz.id = :quizId")
    Double findAverageScore(@Param("quizId") Long quizId);

    @Query("SELECT COUNT(a) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.passed = true")
    Long countPassed(@Param("quizId") Long quizId);

    @Query("SELECT COUNT(a) FROM QuizAttempt a WHERE a.quiz.id = :quizId")
    Long countAttempts(@Param("quizId") Long quizId);
}
