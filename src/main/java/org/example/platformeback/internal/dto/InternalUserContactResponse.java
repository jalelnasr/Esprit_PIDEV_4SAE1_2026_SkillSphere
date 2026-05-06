package org.example.platformeback.internal.dto;

public record InternalUserContactResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String role
) {
}
