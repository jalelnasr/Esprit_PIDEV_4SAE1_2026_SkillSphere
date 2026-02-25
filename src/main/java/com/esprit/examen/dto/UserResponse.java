package com.esprit.examen.dto;

import com.esprit.examen.entities.Role;

import java.time.Instant;

public record UserResponse(
    Long idUser,
    String nom,
    String prenom,
    String email,
    Role role,
    String phone,
    String adresse,
    Boolean isActive,
    Instant createdAt,
    Integer totalPoints,
    Integer level,
    String rank
) {}
