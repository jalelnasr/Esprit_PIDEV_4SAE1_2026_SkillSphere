package org.example.b2bmodule.dto;

public record NotificationRequest(
    Long userId,
    String type,
    String title,
    String message,
    String link,
    Long relatedEntityId,
    String relatedEntityType,
    String priority,
    String icon
) {}
