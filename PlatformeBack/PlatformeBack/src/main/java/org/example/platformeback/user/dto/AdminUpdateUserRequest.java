package org.example.platformeback.user.dto;

public record AdminUpdateUserRequest(
        String nom,
        String prenom,
        String email,
        String phone,
        String adresse
) {}