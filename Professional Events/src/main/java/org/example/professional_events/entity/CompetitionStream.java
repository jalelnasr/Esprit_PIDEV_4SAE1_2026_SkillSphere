package org.example.professional_events.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "competition_streams")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class CompetitionStream {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "competition_id", nullable = false)
    private Long competitionId;

    @Column(name = "stream_url", nullable = false, length = 500)
    private String streamUrl;

    @Column(name = "platform")
    private String platform; // YOUTUBE, TWITCH, ZOOM, MEET, OTHER

    @Column(name = "title")
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StreamStatus status = StreamStatus.OFFLINE;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "stopped_at")
    private LocalDateTime stoppedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Auto-expiration: heures avant passage OFFLINE (null = jamais)
    @Column(name = "auto_expire_hours")
    private Integer autoExpireHours;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum StreamStatus { LIVE, OFFLINE }
}
