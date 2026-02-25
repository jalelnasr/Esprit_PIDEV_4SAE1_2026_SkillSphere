package com.esprit.examen.dto;

public record ChangePasswordRequest(
    String oldPassword,
    String newPassword
) {}
