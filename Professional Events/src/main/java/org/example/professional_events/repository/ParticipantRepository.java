package org.example.professional_events.repository;

import org.example.professional_events.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    List<Participant> findByCompetitionId(Long competitionId);
    List<Participant> findByUserId(Long userId);

    Optional<Participant> findByUserIdAndCompetitionId(Long userId, Long competitionId);

    long countByCompetitionId(Long competitionId);
}