package org.example.platformeback.user.dto;

import org.example.platformeback.user.model.Role;

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