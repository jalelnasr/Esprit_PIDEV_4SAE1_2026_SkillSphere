package org.example.platformeback.auth.dto;

public record ResetPasswordRequest(String token, String newPassword) {}