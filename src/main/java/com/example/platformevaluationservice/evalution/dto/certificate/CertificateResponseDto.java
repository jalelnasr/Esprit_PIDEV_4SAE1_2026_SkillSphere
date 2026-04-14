package com.example.platformevaluationservice.evalution.dto.certificate;

import com.example.platformevaluationservice.evalution.model.CertificateStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CertificateResponseDto {
    private Long id;
    private Long apprenantId;
    private String apprenantFirstName;
    private String apprenantLastName;
    private Long evaluationId;
    private String evaluationTitle;
    private Long formateurId;
    private Integer bestScore;
    private Boolean passed;
    private CertificateStatus status;
    private String note;
    private Instant requestedAt;
    private Instant issuedAt;
    private String pdfFileName;
}
