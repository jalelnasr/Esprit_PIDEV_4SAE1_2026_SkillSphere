package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "missions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Mission {

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

    private Integer durationWeeks;
    private BigDecimal dailyRate;

    @Column(columnDefinition = "TEXT")
    private String requiredSkills; // comma-separated

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MissionStatus status = MissionStatus.OPEN;

    @OneToMany(mappedBy = "mission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MissionApplication> missionApplications;

    @OneToOne(mappedBy = "mission", cascade = CascadeType.ALL, orphanRemoval = true)
    private Contract contract;

    public enum MissionStatus {
        OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    }
}

