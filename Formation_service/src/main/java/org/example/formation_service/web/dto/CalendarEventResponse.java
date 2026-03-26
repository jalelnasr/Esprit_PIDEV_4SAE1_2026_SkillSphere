package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CalendarEventResponse {
    private Long id;
    private String title;
    private LocalDateTime start;
    private LocalDateTime end;
    private String type;       // "VIRTUAL" or "IN_PERSON"
    private String color;      // "#3B82F6" blue for virtual, "#10B981" green for in-person
    private String meetLink;   // only for VIRTUAL
    private String location;   // only for IN_PERSON
    private Long sessionId;
    private Long meetId;       // only for VIRTUAL
    private String status;
}
