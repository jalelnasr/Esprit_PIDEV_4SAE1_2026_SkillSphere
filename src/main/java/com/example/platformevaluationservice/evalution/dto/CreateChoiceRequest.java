package com.example.platformevaluationservice.evalution.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateChoiceRequest {

    private String label;
    private Boolean isCorrect;

}
