package com.esprit.examen.dto;

import jakarta.validation.constraints.Email;

public record AdminUpdateUserRequest(
    String nom,
    String prenom,
    @Email(message = "Invalid email format")
    String email,
    String phone,
    String adresse
) {}
