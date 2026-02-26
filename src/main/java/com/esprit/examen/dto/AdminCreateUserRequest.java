package com.esprit.examen.dto;

import com.esprit.examen.entities.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCreateUserRequest(
    @NotBlank(message = "Last name is required")
    String nom,
    @NotBlank(message = "First name is required")
    String prenom,
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password,
    Role role,
    String phone,
    String adresse,
    Boolean isActive
) {}
