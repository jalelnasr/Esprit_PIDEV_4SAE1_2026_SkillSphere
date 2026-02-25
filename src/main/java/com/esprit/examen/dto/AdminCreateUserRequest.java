package com.esprit.examen.dto;

import com.esprit.examen.entities.Role;

public record AdminCreateUserRequest(
    String nom,
    String prenom,
    String email,
    String password,
    Role role,
    String phone,
    String adresse,
    Boolean isActive
) {}
