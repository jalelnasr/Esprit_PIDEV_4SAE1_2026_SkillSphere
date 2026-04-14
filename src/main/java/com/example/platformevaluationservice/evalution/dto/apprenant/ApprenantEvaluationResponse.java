package com.example.platformevaluationservice.evalution.dto.apprenant;

import com.example.platformevaluationservice.evalution.model.CertificateStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprenantEvaluationResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Integer bestScore;
    private Boolean passed;
    private Boolean attempted;
    private CertificateStatus certificateStatus;
    private ApprenantQuizSummary quiz;

    @Getter
    @Setter
    public static class ApprenantQuizSummary {
        private Long id;
    }
}
