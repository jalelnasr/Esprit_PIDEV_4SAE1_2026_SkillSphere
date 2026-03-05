package org.example.professional_events.repository;

import org.example.professional_events.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
    List<ChatParticipant> findByCompetitionIdAndIsOnlineTrue(Long competitionId);
    Optional<ChatParticipant> findByCompetitionIdAndUserId(Long competitionId, Long userId);
    Long countByCompetitionIdAndIsOnlineTrue(Long competitionId);
}
