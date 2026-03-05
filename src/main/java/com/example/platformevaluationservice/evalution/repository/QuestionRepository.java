package com.example.platformevaluationservice.evalution.repository;

import com.example.platformevaluationservice.evalution.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {}
