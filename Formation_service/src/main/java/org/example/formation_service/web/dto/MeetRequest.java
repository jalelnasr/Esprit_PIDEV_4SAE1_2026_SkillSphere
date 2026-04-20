package org.example.formation_service.web.dto;

import lombok.Data;

@Data
public class MeetRequest {
    private String title;
    private String description;
    private String scheduledAt; // ISO datetime string
    private Integer durationMinutes;
}
