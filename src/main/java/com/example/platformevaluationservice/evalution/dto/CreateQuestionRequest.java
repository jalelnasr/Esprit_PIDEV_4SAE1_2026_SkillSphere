package com.example.platformevaluationservice.evalution.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateQuestionRequest {

    private String text;
    private Integer points;

}