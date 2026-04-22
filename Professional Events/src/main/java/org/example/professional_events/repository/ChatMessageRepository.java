package org.example.professional_events.repository;

import org.example.professional_events.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByCompetitionIdOrderBySentAtAsc(Long competitionId);
    Long countByCompetitionIdAndIsReadFalse(Long competitionId);
    
    // Filter messages by recipient type
    List<ChatMessage> findByCompetitionIdAndRecipientTypeOrderBySentAtAsc(Long competitionId, String recipientType);
    
    // Filter team messages
    List<ChatMessage> findByCompetitionIdAndTeamIdOrderBySentAtAsc(Long competitionId, Long teamId);
    
    // Filter private messages (sent to or from a specific user)
    List<ChatMessage> findByCompetitionIdAndRecipientTypeAndRecipientIdOrderBySentAtAsc(
        Long competitionId, String recipientType, Long recipientId);
    
    // Méthodes pour les statistiques
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.competitionId IN :competitionIds")
    Long countByCompetitionIdIn(List<Long> competitionIds);
    
    Long countByCompetitionId(Long competitionId);
    
    Long countBySentAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT COUNT(DISTINCT m.senderId) FROM ChatMessage m WHERE m.competitionId = :competitionId")
    Long countDistinctSendersByCompetitionId(Long competitionId);
}

