package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "contracts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String contractNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", unique = true)
    private Mission mission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false, foreignKey = @ForeignKey(name = "FK_contract_candidate", value = ConstraintMode.CONSTRAINT))
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private BigDecimal totalAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String contractUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ContractStatus status = ContractStatus.DRAFT;

    private Instant signedAt;

    public enum ContractStatus {
        DRAFT, SIGNED, ACTIVE, COMPLETED, CANCELLED
    }

    @PrePersist
    protected void generateContractNumber() {
        if (this.contractNumber == null) {
            this.contractNumber = "CTR-" + System.currentTimeMillis();
        }
    }
}

