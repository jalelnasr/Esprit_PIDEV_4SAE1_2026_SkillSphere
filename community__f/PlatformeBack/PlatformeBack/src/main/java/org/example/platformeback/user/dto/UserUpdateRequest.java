package org.example.platformeback.user.dto;

public record UserUpdateRequest(
        String nom,
        String prenom,
        String phone,
        String adresse
) {}