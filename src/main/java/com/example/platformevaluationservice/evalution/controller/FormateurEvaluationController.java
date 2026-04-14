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

    @PostMapping
    public Evaluation create(@RequestBody CreateEvaluation request) {
        return service.create(request);
    }

    @GetMapping("/formateur/{formateurId}")
    public List<Evaluation> getByFormateur(@PathVariable Long formateurId) {
        return service.getByFormateur(formateurId);
    }

    @GetMapping("/formateur/{formateurId}/search")
    public List<Evaluation> searchByFormateurAndTitle(@PathVariable Long formateurId,
                                                      @RequestParam String title) {
        return service.searchByFormateurAndTitle(formateurId, title);
    }

    @GetMapping("/{id}")
    public Evaluation getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Evaluation update(@PathVariable Long id,
                             @RequestBody UpdateEvaluation request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PutMapping("/{id}/publish")
    public Evaluation publish(@PathVariable Long id) {
        return service.publish(id);
    }
}