package org.example.professional_events.repository;

import org.example.professional_events.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByCompetition_CompetitionId(Long competitionId);
    
    List<Team> findByCompetition_CompetitionIdAndIsQualified(Long competitionId, Boolean isQualified);
}
