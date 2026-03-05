package org.example.professional_events.repository;

import org.example.professional_events.entity.Award;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AwardRepository extends JpaRepository<Award, Long> {
    List<Award> findByUserId(Long userId);
    List<Award> findByCompetitionId(Long competitionId);
    List<Award> findByType(Award.AwardType type);
}

