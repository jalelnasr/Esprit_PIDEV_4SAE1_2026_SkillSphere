package com.example.platformevaluationservice.evalution.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private EvaluationStatus status;

    private Long formateurId;

    @OneToOne(mappedBy = "evaluation", cascade = CascadeType.ALL)
    private Quiz quiz;
}