package com.esprit.examen.dto;

import java.util.Map;

public record PlatformStatsResponse(
    Long totalUsers,
    Long totalLabs,
    Long totalLabCategories,
    Long totalBadges,
    Long totalReviews,
    Long totalStepsCompleted,
    Long totalLabInstances,
    Map<String, Long> usersByRank,
    Map<String, Long> labsByDifficulty,
    Double platformAveragePoints
) {}
