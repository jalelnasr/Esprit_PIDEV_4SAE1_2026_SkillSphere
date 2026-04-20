package org.example.platformeback.auth.dto;

public record RegisterRequest(
        String nom,
        String prenom,
        String email,
        String password,
        String phone,
        String adresse
) {}