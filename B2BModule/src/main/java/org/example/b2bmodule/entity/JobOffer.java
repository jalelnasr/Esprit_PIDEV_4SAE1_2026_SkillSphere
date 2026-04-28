package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "job_offers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @NotBlank
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String contractType; // CDI, CDD, STAGE, ALTERNANCE
    private String location;

    @Column(columnDefinition = "TEXT")
    private String requiredSkills; // comma-separated

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JobOfferStatus status = JobOfferStatus.OPEN;

    @Builder.Default
    private Instant postedAt = Instant.now();

    @OneToMany(mappedBy = "jobOffer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications;

    public enum JobOfferStatus {
        OPEN, CLOSED, FILLED
    }

    @PrePersist
    protected void onCreate() {
        if (this.postedAt == null) this.postedAt = Instant.now();
    }
}

