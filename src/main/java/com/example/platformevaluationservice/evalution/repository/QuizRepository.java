package com.example.platformevaluationservice.evalution.repository;

import com.example.platformevaluationservice.evalution.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> { List<Quiz> findAll();}
