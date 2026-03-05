package com.example.platformevaluationservice.evalution.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuizResponse {

    private Long id;
    private Integer passingScore;
    private Long evaluationId;
    private List<QuestionResponse> questions;

}