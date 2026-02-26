package com.esprit.examen.services;

import com.esprit.examen.dto.LeaderboardEntry;

import java.util.List;

public interface LeaderboardService {

    List<LeaderboardEntry> getGlobalLeaderboard();

    List<LeaderboardEntry> getTopN(int n);

    List<LeaderboardEntry> getLeaderboardByRank(String rank);

    LeaderboardEntry getUserPosition(Long userId);
}
