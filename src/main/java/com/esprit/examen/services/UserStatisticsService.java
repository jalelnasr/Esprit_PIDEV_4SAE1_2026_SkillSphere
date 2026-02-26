package com.esprit.examen.services;

import com.esprit.examen.dto.PlatformStatsResponse;
import com.esprit.examen.dto.UserStatsResponse;

public interface UserStatisticsService {

    UserStatsResponse getUserStats(Long userId);

    PlatformStatsResponse getPlatformStats();
}
