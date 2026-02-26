package com.esprit.examen.dto;

public record LeaderboardEntry(
    Long position,
    Long idUser,
    String nom,
    String prenom,
    Integer totalPoints,
    Integer level,
    String rank,
    Long completedSteps,
    Long badgesCount
) {}
