package org.example.b2bmodule.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    Long userId,
    String type,
    String title,
    String message,
    String link,
    Long relatedEntityId,
    String relatedEntityType,
    Boolean isRead,
    LocalDateTime createdAt,
    LocalDateTime readAt,
    String priority,
    String icon
) {}
