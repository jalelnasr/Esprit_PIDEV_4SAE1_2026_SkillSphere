package org.example.platformeback.auth.dto;

import org.example.platformeback.user.model.Role;

public record AuthResponse(
        String token,
        Long idUser,
        String nom,
        String prenom,
        String email,
        Role role
) {}
