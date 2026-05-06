package org.example.platformeback.user.dto;

public record ChangePasswordRequest(
        String oldPassword,
        String newPassword
) {}