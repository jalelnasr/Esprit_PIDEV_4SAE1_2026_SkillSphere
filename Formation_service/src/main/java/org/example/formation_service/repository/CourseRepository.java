package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByStatus(CourseStatus status);
    
    List<Course> findByCreatedBy(Long createdBy);
    
    @Modifying
    @Query("DELETE FROM LearningPathItem lpi WHERE lpi.course.id = :courseId")
    void deleteLearningPathItemsByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query("DELETE FROM Enrollment e WHERE e.course.id = :courseId")
    void deleteEnrollmentsByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query("DELETE FROM Session s WHERE s.course.id = :courseId")
    void deleteSessionsByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query("DELETE FROM Lesson l WHERE l.course.id = :courseId")
    void deleteLessonsByCourseId(@Param("courseId") Long courseId);
}
