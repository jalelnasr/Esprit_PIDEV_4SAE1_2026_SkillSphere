package org.example.formation_service.web.dto;

import lombok.Builder;
import lombok.Data;
import org.example.formation_service.domain.entity.SessionMeet;

import java.time.LocalDateTime;

@Data
@Builder
public class MeetResponse {
    private Long id;
    private Long sessionId;
    private String sessionCourseTitle;
    private Long formateurId;
    private String title;
    private String description;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetToken;
    private String meetLink;
    private String status;
    private LocalDateTime createdAt;
    private long participantCount;

    public static MeetResponse from(SessionMeet meet, long participantCount) {
        return MeetResponse.builder()
            .id(meet.getId())
            .sessionId(meet.getSession().getId())
            .sessionCourseTitle(meet.getSession().getCourse() != null
                ? meet.getSession().getCourse().getTitle() : "")
            .formateurId(meet.getFormateurId())
            .title(meet.getTitle())
            .description(meet.getDescription())
            .scheduledAt(meet.getScheduledAt())
            .durationMinutes(meet.getDurationMinutes())
            .meetToken(meet.getMeetToken())
            .meetLink(meet.getMeetLink())
            .status(meet.getStatus().name())
            .createdAt(meet.getCreatedAt())
            .participantCount(participantCount)
            .build();
    }
}
