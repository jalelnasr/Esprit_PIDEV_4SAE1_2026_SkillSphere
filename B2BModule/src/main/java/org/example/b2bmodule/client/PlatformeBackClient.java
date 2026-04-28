package org.example.b2bmodule.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign Client pour communiquer avec le microservice auth-service (User Service)
 * 
 * @FeignClient :
 * - name : Nom du service dans Eureka
 * - path : Préfixe commun pour tous les endpoints
 */
@FeignClient(
    name = "auth-service",
    path = "/api/users"
)
public interface PlatformeBackClient {

    /**
     * Récupérer les utilisateurs RH d'une entreprise
     * 
     * Endpoint appelé : GET http://auth-service/api/users/internal/company/{companyId}/rh
     * 
     * @param companyId ID de l'entreprise
     * @return Liste des utilisateurs RH
     */
    @GetMapping("/internal/company/{companyId}/rh")
    List<UserResponse> getRhUsersByCompanyId(@PathVariable("companyId") Long companyId);

    /**
     * DTO pour la réponse du microservice User
     */
    record UserResponse(
        Long idUser,
        String nom,
        String prenom,
        String email,
        String role,
        Long companyId
    ) {}
}
