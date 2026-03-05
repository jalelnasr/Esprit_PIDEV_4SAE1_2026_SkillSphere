package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "mission_applications",
       uniqueConstraints = @UniqueConstraint(columnNames = {"mission_id", "candidate_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MissionApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false, foreignKey = @ForeignKey(name = "FK_mission_application_candidate", value = ConstraintMode.CONSTRAINT))
    private Candidate candidate;

    private BigDecimal proposedRate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MissionAppStatus status = MissionAppStatus.PENDING;

    @Builder.Default
    private Instant appliedAt = Instant.now();

    public enum MissionAppStatus {
        PENDING, ACCEPTED, REJECTED
    }

    @PrePersist
    protected void onCreate() {
        if (this.appliedAt == null) this.appliedAt = Instant.now();
    }
}

