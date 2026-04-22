package org.example.professional_events.repository;

import org.example.professional_events.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByCompetition_CompetitionId(Long competitionId);
    
    List<Team> findByCompetition_CompetitionIdAndIsQualified(Long competitionId, Boolean isQualified);
    
    // Méthodes pour les statistiques
    @Query("SELECT COUNT(t) FROM Team t WHERE t.competition.competitionId IN :competitionIds")
    Long countByCompetitionIdIn(List<Long> competitionIds);
    
    @Query("SELECT COUNT(t) FROM Team t WHERE t.competition.competitionId = :competitionId")
    Long countByCompetitionId(Long competitionId);
}

