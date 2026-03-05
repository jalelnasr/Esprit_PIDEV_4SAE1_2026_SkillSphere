package com.example.platformevaluationservice.evalution.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long apprenantId;

    private String title; // ex: Certification Java
    private String description;

    private Instant issuedAt;

    private Boolean active;

    @PrePersist
    public void onCreate() {
        this.issuedAt = Instant.now();
        if (active == null) {
            active = true;
        }
    }
}