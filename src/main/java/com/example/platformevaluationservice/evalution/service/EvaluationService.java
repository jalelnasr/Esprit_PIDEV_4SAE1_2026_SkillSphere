package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.CreateEvaluation;
import com.example.platformevaluationservice.evalution.dto.UpdateEvaluation;
import com.example.platformevaluationservice.evalution.model.Evaluation;

import java.util.List;

public interface EvaluationService {

    Evaluation create(CreateEvaluation request);

    List<Evaluation> getByFormateur(Long formateurId);

    List<Evaluation> searchByFormateurAndTitle(Long formateurId, String title);

    List<Evaluation> getPublishedForApprenant();

    Evaluation getById(Long id);

    Evaluation update(Long id, UpdateEvaluation request);

    void delete(Long id);

    Evaluation publish(Long id);
}