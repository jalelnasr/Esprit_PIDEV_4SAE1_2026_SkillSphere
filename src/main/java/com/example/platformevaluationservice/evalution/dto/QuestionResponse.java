package com.example.platformevaluationservice.evalution.dto;

import java.util.List;

public class QuestionResponse {

    private Long id;
    private String text;
    private Integer points;
    private List<ChoiceResponse> choices;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public List<ChoiceResponse> getChoices() { return choices; }
    public void setChoices(List<ChoiceResponse> choices) { this.choices = choices; }
}