package org.example.professional_events.repository;

import org.example.professional_events.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    
    List<Match> findByCompetition_CompetitionId(Long competitionId);
    
    List<Match> findByCompetition_CompetitionIdOrderByMatchNumberAsc(Long competitionId);
    
    void deleteByCompetition_CompetitionId(Long competitionId);
}
