package com.example.platformevaluationservice.evalution.dto;

public class ChoiceResponse {

    private Long id;
    private String label;
    private Boolean isCorrect;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }
}