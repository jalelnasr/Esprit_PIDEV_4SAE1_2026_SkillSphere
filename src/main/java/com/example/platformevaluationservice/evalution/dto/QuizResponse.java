package com.example.platformevaluationservice.evalution.dto;

import java.util.List;

public class QuizResponse {

    private Long id;
    private Integer passingScore;
    private Long evaluationId;
    private List<QuestionResponse> questions;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getPassingScore() { return passingScore; }
    public void setPassingScore(Integer passingScore) { this.passingScore = passingScore; }

    public Long getEvaluationId() { return evaluationId; }
    public void setEvaluationId(Long evaluationId) { this.evaluationId = evaluationId; }

    public List<QuestionResponse> getQuestions() { return questions; }
    public void setQuestions(List<QuestionResponse> questions) { this.questions = questions; }
}