package org.example.formation_service.feign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a user from PLATFORMEBACK (User Service).
 * Mirrors UserResponse from PlatformeBack.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long idUser;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String phone;
    private Boolean isActive;
}
