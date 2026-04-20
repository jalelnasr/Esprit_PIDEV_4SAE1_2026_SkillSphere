package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.CourseReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {
    
    Optional<CourseReview> findByUserIdAndCourseId(Long userId, Long courseId);
    
    List<CourseReview> findByCourseIdOrderByCreatedAtDesc(Long courseId);
    
    @Query("SELECT AVG(r.rating) FROM CourseReview r WHERE r.courseId = :courseId")
    Double getAverageRatingByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(r) FROM CourseReview r WHERE r.courseId = :courseId")
    long countByCourseId(@Param("courseId") Long courseId);
}
