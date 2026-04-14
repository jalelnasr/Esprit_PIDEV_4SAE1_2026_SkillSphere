package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.CreateEvaluation;
import com.example.platformevaluationservice.evalution.dto.UpdateEvaluation;
import com.example.platformevaluationservice.evalution.model.Evaluation;
import com.example.platformevaluationservice.evalution.model.EvaluationStatus;
import com.example.platformevaluationservice.evalution.repository.EvaluationRepository;
import com.example.platformevaluationservice.evalution.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository repository;
    private final SecurityUtils securityUtils;

    @Override
    public Evaluation create(CreateEvaluation request) {

        Evaluation evaluation = new Evaluation();
        evaluation.setTitle(request.getTitle());
        evaluation.setDescription(request.getDescription());
        evaluation.setStatus(EvaluationStatus.DRAFT);
        evaluation.setFormateurId(securityUtils.currentUserId());

        return repository.save(evaluation);
    }

    @Override
    public List<Evaluation> getByFormateur(Long formateurId) {
        if (!securityUtils.hasRole("ADMIN")) {
            Long currentUserId = securityUtils.currentUserId();
            if (currentUserId == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated user");
            }
            if (!currentUserId.equals(formateurId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: you can only read your own evaluations");
            }
        }
        return repository.findByFormateurId(formateurId);
    }

    @Override
    public List<Evaluation> searchByFormateurAndTitle(Long formateurId, String title) {
        if (!securityUtils.hasRole("ADMIN")) {
            Long currentUserId = securityUtils.currentUserId();
            if (currentUserId == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated user");
            }
            if (!currentUserId.equals(formateurId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: you can only search your own evaluations");
            }
        }
        return repository.findByFormateurIdAndTitleContainingIgnoreCase(formateurId, title);
    }

    @Override
    public List<Evaluation> getPublishedForApprenant() {
        return repository.findByStatus(EvaluationStatus.PUBLISHED);
    }

    @Override
    public Evaluation getById(Long id) {
        Evaluation evaluation = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evaluation not found"));

        if (!securityUtils.hasRole("ADMIN")
                && evaluation.getFormateurId() != null
                && !evaluation.getFormateurId().equals(securityUtils.currentUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return evaluation;
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
        Evaluation evaluation = getById(id);
        repository.deleteById(evaluation.getId());
    }

    @Override
    public Evaluation publish(Long id) {
        Evaluation evaluation = getById(id);
        evaluation.setStatus(EvaluationStatus.PUBLISHED);
        return repository.save(evaluation);
    }
}