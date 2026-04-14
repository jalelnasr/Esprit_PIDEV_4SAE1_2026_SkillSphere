package com.example.platformevaluationservice.evalution.dto.apprenant;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApprenantQuestionResponse {
    private Long id;
    private String text;
    private Integer points;
    private List<ApprenantChoiceResponse> choices;
}
