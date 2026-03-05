package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.CreateEvaluation;
import com.example.platformevaluationservice.evalution.dto.UpdateEvaluation;
import com.example.platformevaluationservice.evalution.model.Evaluation;
import com.example.platformevaluationservice.evalution.model.EvaluationStatus;
import com.example.platformevaluationservice.evalution.repository.EvaluationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository repository;

    @Override
    public Evaluation create(CreateEvaluation request) {

        Evaluation evaluation = new Evaluation();
        evaluation.setTitle(request.getTitle());
        evaluation.setDescription(request.getDescription());
        evaluation.setStatus(EvaluationStatus.DRAFT);

        return repository.save(evaluation);
    }

    @Override
    public List<Evaluation> getByFormateur(Long formateurId) {
        return repository.findByFormateurId(formateurId);
    }

    @Override
    public Evaluation getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));
    }

    @Override
    public Evaluation update(Long id, UpdateEvaluation request) {

        Evaluation evaluation = getById(id);

        evaluation.setTitle(request.getTitle());
        evaluation.setDescription(request.getDescription());

        return repository.save(evaluation);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Evaluation publish(Long id) {

        Evaluation evaluation = getById(id);
        evaluation.setStatus(EvaluationStatus.PUBLISHED);

        return repository.save(evaluation);
    }
}
