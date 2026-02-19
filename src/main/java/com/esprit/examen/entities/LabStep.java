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
@Table(name = "lab_steps")
public class LabStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stepId;

    private Integer stepNumber;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String hint;

    private String flag;

    private Integer points;

    @ManyToOne
    @JoinColumn(name = "lab_id")
    private Lab lab;

    @JsonIgnore
    @OneToMany(mappedBy = "labStep", cascade = CascadeType.ALL)
    private List<UserProgress> userProgressList;
}