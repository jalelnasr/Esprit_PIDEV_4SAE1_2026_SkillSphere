package com.esprit.examen.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "USER-SERVICE", url = "${user.service.url:http://localhost:8086}")
public interface UserFeignClient {

    @GetMapping("/api/users/me")
    UserResponse getMe(@RequestHeader("Authorization") String authorizationHeader);

    @GetMapping("/api/users/admin/{id}")
    UserResponse getUserById(@PathVariable("id") Long id);

    // DTO class to match user microservice response
    class UserResponse {
        private Long idUser;
        private String nom;
        private String prenom;
        private String email;
        private String role;
        private String phone;
        private String adresse;
        private Boolean isActive;
        private String createdAt;

        // Default constructor
        public UserResponse() {}

        // All-args constructor
        public UserResponse(Long idUser, String nom, String prenom, String email, String role, 
                           String phone, String adresse, Boolean isActive, String createdAt) {
            this.idUser = idUser;
            this.nom = nom;
            this.prenom = prenom;
            this.email = email;
            this.role = role;
            this.phone = phone;
            this.adresse = adresse;
            this.isActive = isActive;
            this.createdAt = createdAt;
        }

        // Getters and Setters
        public Long getIdUser() { return idUser; }
        public void setIdUser(Long idUser) { this.idUser = idUser; }
        
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public String getAdresse() { return adresse; }
        public void setAdresse(String adresse) { this.adresse = adresse; }
        
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }
}
