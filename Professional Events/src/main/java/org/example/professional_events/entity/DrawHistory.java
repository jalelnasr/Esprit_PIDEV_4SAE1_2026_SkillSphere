package org.example.professional_events.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "draw_history")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class DrawHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long drawId;

    @ManyToOne
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @Column(name = "drawn_by", nullable = false)
    private Long drawnBy;

    @Column(name = "draw_date")
    private LocalDateTime drawDate;

    @Column(name = "qualified_teams_count", nullable = false)
    private Integer qualifiedTeamsCount;

    @Column(name = "matches_created", nullable = false)
    private Integer matchesCreated;

    @Column(length = 1000)
    private String notes;

    @PrePersist
    protected void onCreate() {
        this.drawDate = LocalDateTime.now();
    }
}
