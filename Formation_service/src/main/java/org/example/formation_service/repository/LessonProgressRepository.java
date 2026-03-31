package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByEnrollmentIdAndLessonId(Long enrollmentId, Long lessonId);
    List<LessonProgress> findByEnrollmentId(Long enrollmentId);
    long countByEnrollmentIdAndCompletedTrue(Long enrollmentId);
}
