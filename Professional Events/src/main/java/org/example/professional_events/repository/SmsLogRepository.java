package org.example.professional_events.repository;

import org.example.professional_events.entity.SmsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SmsLogRepository extends JpaRepository<SmsLog, Long> {
    List<SmsLog> findByUserId(Long userId);
    List<SmsLog> findByCompetitionId(Long competitionId);
    List<SmsLog> findByMatchId(Long matchId);
    List<SmsLog> findByStatus(String status);
    List<SmsLog> findBySmsType(String smsType);
    List<SmsLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    Long countByStatus(String status);
    Long countBySmsType(String smsType);
}
