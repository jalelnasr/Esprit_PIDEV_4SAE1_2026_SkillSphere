package com.example.platformevaluationservice.evalution.controller;

import com.example.platformevaluationservice.evalution.dto.CreateEvaluation;
import com.example.platformevaluationservice.evalution.dto.UpdateEvaluation;
import com.example.platformevaluationservice.evalution.model.Evaluation;
import com.example.platformevaluationservice.evalution.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formateur/evaluations")
@RequiredArgsConstructor
public class FormateurEvaluationController {

    private final EvaluationService service;

    // Create
    @PostMapping
    public Evaluation create(@RequestBody CreateEvaluation request) {
        return service.create(request);
    }

    // Get all by formateur
    @GetMapping("/formateur/{formateurId}")
    public List<Evaluation> getByFormateur(@PathVariable Long formateurId) {
        return service.getByFormateur(formateurId);
    }

    // Get by id
    @GetMapping("/{id}")
    public Evaluation getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // Update
    @PutMapping("/{id}")
    public Evaluation update(@PathVariable Long id,
                             @RequestBody UpdateEvaluation request) {
        return service.update(id, request);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // Publish
    @PutMapping("/{id}/publish")
    public Evaluation publish(@PathVariable Long id) {
        return service.publish(id);
    }
}