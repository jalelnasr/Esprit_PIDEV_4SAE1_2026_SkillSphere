package com.example.platformevaluationservice.evalution.repository;

import com.example.platformevaluationservice.evalution.model.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    Optional<Attempt> findTopByApprenantIdAndEvaluation_IdOrderByScoreDesc(Long apprenantId, Long evaluationId);

    List<Attempt> findByApprenantIdAndEvaluation_IdIn(Long apprenantId, Collection<Long> evaluationIds);

    List<Attempt> findByApprenantIdAndEvaluation_IdOrderBySubmittedAtDesc(Long apprenantId, Long evaluationId);
}
