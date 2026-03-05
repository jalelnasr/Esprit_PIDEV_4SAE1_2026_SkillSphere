package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "progress")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false, unique = true)
    private Assignment assignment;

    @Builder.Default
    private Integer progressPercent = 0;

    private Instant startedAt;
    private Instant completedAt;

    @Builder.Default
    private Boolean passed = false;

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.updatedAt == null) this.updatedAt = Instant.now();
        if (this.progressPercent == null) this.progressPercent = 0;
        if (this.passed == null) this.passed = false;
    }
}

