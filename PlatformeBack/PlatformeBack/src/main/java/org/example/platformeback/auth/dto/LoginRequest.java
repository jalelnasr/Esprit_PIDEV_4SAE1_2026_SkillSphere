package org.example.platformeback.auth.dto;

public record LoginRequest(
        String email,
        String password
) {}
