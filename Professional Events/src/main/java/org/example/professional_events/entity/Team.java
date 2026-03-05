package org.example.professional_events.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    @ManyToOne
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    private String teamName;

    private Integer maxMembers;
    private Integer currentMembers;

    private LocalDateTime creationDate;

    private Long teamLeaderId;

    // Qualification fields
    @Column(name = "is_qualified")
    private Boolean isQualified = false;

    @Column(name = "qualified_at")
    private LocalDateTime qualifiedAt;

    @Column(name = "qualified_by")
    private Long qualifiedBy;

    public boolean isFull() {
        return currentMembers != null && maxMembers != null && currentMembers >= maxMembers;
    }

    public Long getCompetitionId() {
        return competition != null ? competition.getCompetitionId() : null;
    }
}