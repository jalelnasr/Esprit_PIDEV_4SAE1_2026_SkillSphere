package com.example.platformevaluationservice.evalution.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateQuizRequest {

    private Integer passingScore;
    private List<QuestionRequest> questions;

}