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
    @Query(value = "DELETE FROM meet_joins WHERE meet_id IN (SELECT id FROM session_meets WHERE session_id IN (SELECT id FROM sessions WHERE course_id = :courseId))", nativeQuery = true)
    void deleteMeetJoinsByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query(value = "DELETE FROM session_meets WHERE session_id IN (SELECT id FROM sessions WHERE course_id = :courseId)", nativeQuery = true)
    void deleteSessionMeetsByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query(value = "DELETE FROM session_enrollments WHERE session_id IN (SELECT id FROM sessions WHERE course_id = :courseId)", nativeQuery = true)
    void deleteSessionEnrollmentsByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query("DELETE FROM Session s WHERE s.course.id = :courseId")
    void deleteSessionsByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query(value = "DELETE FROM lesson_progress WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = :courseId)", nativeQuery = true)
    void deleteLessonProgressByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query(value = "DELETE FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = :courseId))", nativeQuery = true)
    void deleteQuizAttemptsByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query(value = "DELETE FROM answer_options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = :courseId)))", nativeQuery = true)
    void deleteAnswerOptionsByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query(value = "DELETE FROM questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = :courseId))", nativeQuery = true)
    void deleteQuestionsByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query(value = "DELETE FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = :courseId)", nativeQuery = true)
    void deleteQuizzesByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query(value = "DELETE FROM lesson_resources WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = :courseId)", nativeQuery = true)
    void deleteLessonResourcesByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query("DELETE FROM Lesson l WHERE l.course.id = :courseId")
    void deleteLessonsByCourseId(@Param("courseId") Long courseId);
    
    @Modifying
    @Query(value = "DELETE FROM course_reviews WHERE course_id = :courseId", nativeQuery = true)
    void deleteCourseReviewsByCourseId(@Param("courseId") Long courseId);
}
