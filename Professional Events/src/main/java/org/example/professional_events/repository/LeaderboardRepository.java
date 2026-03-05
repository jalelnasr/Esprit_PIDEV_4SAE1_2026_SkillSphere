package org.example.professional_events.repository;

import org.example.professional_events.entity.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    List<Leaderboard> findByCompetitionId(Long competitionId);
    List<Leaderboard> findByCompetitionIdOrderByRank(Long competitionId);
    List<Leaderboard> findByUserId(Long userId);
    List<Leaderboard> findByTeamId(Long teamId);
}

