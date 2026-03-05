package com.example.platformevaluationservice.evalution.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long apprenantId;

    private Double score;
    private Boolean passed;

    private Instant startedAt;
    private Instant submittedAt;

    @ManyToOne
    private Evaluation evaluation;
}