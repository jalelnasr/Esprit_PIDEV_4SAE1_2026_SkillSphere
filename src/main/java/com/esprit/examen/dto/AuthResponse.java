package com.esprit.examen.dto;

import com.esprit.examen.entities.Role;

public record AuthResponse(
    String token,
    Long idUser,
    String nom,
    String prenom,
    String email,
    Role role
) {}
