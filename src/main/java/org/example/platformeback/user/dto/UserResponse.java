package org.example.platformeback.user.dto;

import org.example.platformeback.user.model.Role;

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
        Instant createdAt
) {}