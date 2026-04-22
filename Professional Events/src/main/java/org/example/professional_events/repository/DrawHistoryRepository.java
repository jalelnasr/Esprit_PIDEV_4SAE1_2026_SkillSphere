package org.example.professional_events.repository;

import org.example.professional_events.entity.DrawHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrawHistoryRepository extends JpaRepository<DrawHistory, Long> {
    
    List<DrawHistory> findByCompetition_CompetitionIdOrderByDrawDateDesc(Long competitionId);
    
    List<DrawHistory> findByDrawnBy(Long drawnBy);
}
