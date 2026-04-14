package com.example.platformevaluationservice.evalution.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long apprenantId;

    private String apprenantFirstName;
    private String apprenantLastName;

    private Long evaluationId;
    private String evaluationTitle;
    private Long formateurId;
    private Integer bestScore;
    private Boolean passed;

    @Enumerated(EnumType.STRING)
    private CertificateStatus status;

    private Instant requestedAt;

    private String title; // ex: Certification Java
    private String description;

    @Column(length = 500)
    private String note;

    private Instant issuedAt;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] pdfContent;

    private String pdfFileName;

    private Boolean active;

    @PrePersist
    public void onCreate() {
        this.requestedAt = Instant.now();
        if (status == null) {
            status = CertificateStatus.PENDING;
        }
        if (active == null) {
            active = true;
        }
    }
}