package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long idUser;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String phone;
    private String adresse;
    private Boolean isActive;
    private LocalDateTime createdAt;
    
    public String getFullName() {
        return nom + " " + prenom;
    }
}
