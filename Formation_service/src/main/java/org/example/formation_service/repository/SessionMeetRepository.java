package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.SessionMeet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SessionMeetRepository extends JpaRepository<SessionMeet, Long> {

    List<SessionMeet> findBySession_IdOrderByScheduledAtAsc(Long sessionId);

    List<SessionMeet> findByFormateurIdOrderByScheduledAtAsc(Long formateurId);

    // All meets for a formateur in a date range (for calendar)
    @Query("SELECT m FROM SessionMeet m WHERE m.formateurId = :formateurId " +
           "AND m.scheduledAt BETWEEN :start AND :end ORDER BY m.scheduledAt ASC")
    List<SessionMeet> findByFormateurIdAndDateRange(
        @Param("formateurId") Long formateurId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    // All meets for sessions a user is enrolled in (for apprenant calendar)
    @Query("SELECT m FROM SessionMeet m " +
           "JOIN m.session s " +
           "JOIN Enrollment e ON e.course = s.course AND e.userId = :userId " +
           "WHERE m.scheduledAt BETWEEN :start AND :end " +
           "AND m.status != 'CANCELLED' " +
           "ORDER BY m.scheduledAt ASC")
    List<SessionMeet> findForApprenantCalendar(
        @Param("userId") Long userId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    // Today's meets for apprenant
    @Query("SELECT m FROM SessionMeet m " +
           "JOIN m.session s " +
           "JOIN Enrollment e ON e.course = s.course AND e.userId = :userId " +
           "WHERE DATE(m.scheduledAt) = CURRENT_DATE " +
           "AND m.status != 'CANCELLED' " +
           "ORDER BY m.scheduledAt ASC")
    List<SessionMeet> findTodayMeetsForApprenant(@Param("userId") Long userId);

    // Today's meets for formateur
    @Query("SELECT m FROM SessionMeet m WHERE m.formateurId = :formateurId " +
           "AND DATE(m.scheduledAt) = CURRENT_DATE " +
           "AND m.status != 'CANCELLED' " +
           "ORDER BY m.scheduledAt ASC")
    List<SessionMeet> findTodayMeetsForFormateur(@Param("formateurId") Long formateurId);

    // Upcoming meets for apprenant (next 7 days)
    @Query("SELECT m FROM SessionMeet m " +
           "JOIN m.session s " +
           "JOIN Enrollment e ON e.course = s.course AND e.userId = :userId " +
           "WHERE m.scheduledAt >= :now " +
           "AND m.status != 'CANCELLED' " +
           "ORDER BY m.scheduledAt ASC")
    List<SessionMeet> findUpcomingMeetsForApprenant(
        @Param("userId") Long userId,
        @Param("now") LocalDateTime now
    );

    // Upcoming meets for formateur
    @Query("SELECT m FROM SessionMeet m WHERE m.formateurId = :formateurId " +
           "AND m.scheduledAt >= :now " +
           "AND m.status != 'CANCELLED' " +
           "ORDER BY m.scheduledAt ASC")
    List<SessionMeet> findUpcomingMeetsForFormateur(
        @Param("formateurId") Long formateurId,
        @Param("now") LocalDateTime now
    );
}
