package com.esprit.examen.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "labs")
public class Lab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long labId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String difficulty;

    private Integer points;

    private Integer estimatedDurationMinutes;

    private Integer maxRuntimeMinutes = 120;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    private Integer requiredLevel = 1;

    private Boolean active = true;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private LabCategory category;

    @OneToOne(mappedBy = "lab", cascade = CascadeType.ALL)
    private DockerTemplate dockerTemplate;

    @JsonIgnore
    @OneToMany(mappedBy = "lab", cascade = CascadeType.ALL)
    private List<LabStep> labSteps;

    @JsonIgnore
    @OneToMany(mappedBy = "lab", cascade = CascadeType.ALL)
    private List<LabInstance> labInstances;

    @JsonIgnore
    @OneToMany(mappedBy = "lab", cascade = CascadeType.ALL)
    private List<LabReview> labReviews;
}