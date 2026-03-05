package com.example.platformevaluationservice.evalution.repository;

import com.example.platformevaluationservice.evalution.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByFormateurId(Long formateurId);

}
