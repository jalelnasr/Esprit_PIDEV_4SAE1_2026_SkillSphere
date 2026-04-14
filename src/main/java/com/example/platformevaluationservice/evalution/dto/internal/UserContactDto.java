package com.example.platformevaluationservice.evalution.dto.internal;

public record UserContactDto(
        Long id,
        String email,
        String firstName,
        String lastName,
        String role
) {
}
