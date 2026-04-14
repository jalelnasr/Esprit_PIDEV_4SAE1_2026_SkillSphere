package com.example.platformevaluationservice.evalution.dto.certificate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestCertificateDto {
    private Long evaluationId;
    private String apprenantFirstName;
    private String apprenantLastName;
}
