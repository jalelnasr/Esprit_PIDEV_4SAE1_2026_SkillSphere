package org.example.professional_events.repository;

import org.example.professional_events.entity.CompetitionStream;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompetitionStreamRepository extends JpaRepository<CompetitionStream, Long> {

    Optional<CompetitionStream> findByCompetitionId(Long competitionId);

    Optional<CompetitionStream> findByCompetitionIdAndStatus(
        Long competitionId, CompetitionStream.StreamStatus status);

    // Trouver tous les streams LIVE qui ont dépassé leur expiration
    @Query("SELECT s FROM CompetitionStream s WHERE s.status = 'LIVE' " +
           "AND s.autoExpireHours IS NOT NULL " +
           "AND s.startedAt IS NOT NULL " +
           "AND s.startedAt < :expiryTime")
    List<CompetitionStream> findExpiredStreams(@Param("expiryTime") LocalDateTime expiryTime);
}
