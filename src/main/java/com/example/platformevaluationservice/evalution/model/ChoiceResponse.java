package com.example.platformevaluationservice.evalution.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChoiceResponse {

    private Long id;
    private String label;
    private Boolean isCorrect;

}
