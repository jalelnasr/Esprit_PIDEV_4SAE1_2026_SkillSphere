package com.esprit.examen.dto;

import java.time.LocalDateTime;

public record LabReviewResponse(
    Long reviewId,
    Long userId,
    String userNom,
    String userPrenom,
    Long labId,
    String labTitle,
    Integer rating,
    String comment,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
