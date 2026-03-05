package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "candidates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {

    @Id
    private Long id; // = User ID from User module (pas auto-généré)

    private String title; // ex: "Développeur Full Stack"

    @Column(columnDefinition = "TEXT")
    private String skills; // comma-separated

    private Integer experienceYears;
    private String resumeUrl;

    @Builder.Default
    private Boolean isLookingForJob = true;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MissionApplication> missionApplications;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Contract> contracts;
}

