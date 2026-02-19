package com.esprit.examen.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "lab_instances")
public class LabInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long instanceId;

    private String containerId;

    private String containerName;

    private String status = "PENDING";

    private String accessUrl;

    private Integer assignedPort;

    private LocalDateTime startedAt;

    private LocalDateTime stoppedAt;

    private LocalDateTime completedAt;

    private String errorMessage;

    private Integer score = 0;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "lab_id")
    private Lab lab;
}