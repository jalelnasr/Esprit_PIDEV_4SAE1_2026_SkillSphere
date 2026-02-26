package com.esprit.examen.dto;

public record LabRatingSummary(
    Long labId,
    String labTitle,
    Double averageRating,
    Long totalReviews
) {}
