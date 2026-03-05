package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "applications",
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_offer_id", "candidate_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_offer_id", nullable = false)
    private JobOffer jobOffer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false, foreignKey = @ForeignKey(name = "FK_application_candidate", value = ConstraintMode.CONSTRAINT))
    private Candidate candidate;

    @Builder.Default
    private Double matchScore = 0.0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Builder.Default
    private Instant appliedAt = Instant.now();

    public enum ApplicationStatus {
        PENDING, REVIEWED, SHORTLISTED, ACCEPTED, REJECTED
    }

    @PrePersist
    protected void onCreate() {
        if (this.appliedAt == null) this.appliedAt = Instant.now();
    }
}

