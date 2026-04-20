package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByCourseId(Long courseId);
    List<Session> findByCourseIdIn(List<Long> courseIds);

    @Query("SELECT s FROM Session s WHERE s.course.createdBy = :instructorId ORDER BY s.startAt DESC")
    List<Session> findByInstructorId(@Param("instructorId") Long instructorId);

    // For formateur calendar: sessions they own in a date range
    @Query("SELECT s FROM Session s WHERE s.course.createdBy = :formateurId " +
           "AND s.startAt BETWEEN :start AND :end ORDER BY s.startAt ASC")
    List<Session> findByFormateurIdAndDateRange(
        @Param("formateurId") Long formateurId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    // For apprenant calendar: sessions for courses they are enrolled in
    @Query("SELECT s FROM Session s " +
           "JOIN Enrollment e ON e.course = s.course AND e.userId = :userId " +
           "WHERE s.startAt BETWEEN :start AND :end " +
           "ORDER BY s.startAt ASC")
    List<Session> findForApprenantCalendar(
        @Param("userId") Long userId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
