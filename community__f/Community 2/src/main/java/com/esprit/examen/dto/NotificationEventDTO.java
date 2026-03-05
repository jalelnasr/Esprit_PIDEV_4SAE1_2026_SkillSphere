package com.esprit.examen.dto;

public record NotificationEventDTO(
        String type,
        String text,
        Long relatedUserId,
        Long postId,
        Long messageId,
        String createdAt
) {
}
