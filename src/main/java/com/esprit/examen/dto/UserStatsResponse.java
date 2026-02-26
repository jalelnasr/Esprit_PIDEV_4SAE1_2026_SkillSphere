package com.esprit.examen.dto;

import java.util.List;

public record UserStatsResponse(
    Long idUser,
    String nom,
    String prenom,
    Integer totalPoints,
    Integer level,
    String rank,
    Long completedSteps,
    Long totalAttempts,
    Long completedLabs,
    Long activeLabs,
    Long badgesEarned,
    Long reviewsWritten,
    Double averageRatingGiven,
    List<CategoryProgress> categoryBreakdown
) {
    public record CategoryProgress(
        Long categoryId,
        String categoryName,
        Long totalSteps,
        Long completedSteps,
        Double completionPercentage
    ) {}
}
