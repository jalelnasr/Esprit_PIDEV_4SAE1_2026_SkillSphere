package com.example.platformevaluationservice.evalution.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuestionResponse {

    private Long id;
    private String text;
    private Integer points;
    private List<ChoiceResponse> choices;

}