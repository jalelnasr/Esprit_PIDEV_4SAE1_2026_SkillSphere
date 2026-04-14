package com.example.platformevaluationservice.evalution.repository;

import com.example.platformevaluationservice.evalution.model.Evaluation;
import com.example.platformevaluationservice.evalution.model.EvaluationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByFormateurId(Long formateurId);

    List<Evaluation> findByFormateurIdAndTitleContainingIgnoreCase(Long formateurId, String title);

    List<Evaluation> findByStatus(EvaluationStatus status);
}