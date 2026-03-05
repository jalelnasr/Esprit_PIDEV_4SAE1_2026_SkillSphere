package com.example.platformevaluationservice.evalution.dto;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CreateCertificate {
    private Long apprenantId;
    private String title;
    private String description;
}
