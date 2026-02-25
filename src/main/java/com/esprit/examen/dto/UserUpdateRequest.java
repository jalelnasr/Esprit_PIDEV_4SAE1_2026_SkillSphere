package com.esprit.examen.dto;

public record UserUpdateRequest(
    String nom,
    String prenom,
    String phone,
    String adresse
) {}
