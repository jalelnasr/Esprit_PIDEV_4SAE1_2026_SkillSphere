package com.example.platformevaluationservice.evalution.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChoiceRequest {

    private String label;
    private Boolean isCorrect;

}