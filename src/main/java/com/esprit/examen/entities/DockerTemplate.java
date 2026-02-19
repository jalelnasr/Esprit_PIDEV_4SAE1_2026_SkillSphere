package com.esprit.examen.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "docker_templates")
public class DockerTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dockerTemplateId;

    private String imageName;

    private String imageVersion = "latest";

    private String exposedPorts;

    @Column(columnDefinition = "TEXT")
    private String environmentVariables;

    private Double cpuLimit = 1.0;

    private Integer memoryLimitMb = 512;

    private String networkMode = "bridge";

    private String volumeMounts;

    private String startupCommand;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "lab_id", unique = true)
    private Lab lab;
}