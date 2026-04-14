package com.example.platformevaluationservice.evalution.dto.apprenant;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApprenantQuizResponse {
    private Long id;
    private Long evaluationId;
    private List<ApprenantQuestionResponse> questions;
}
