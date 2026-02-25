package com.esprit.examen.dto;

public record ResetPasswordRequest(String token, String newPassword) {}
