package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Client pour communiquer avec le microservice User
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserMicroserviceClient {

    private final RestTemplate restTemplate;

    // Utiliser le nom du service Eureka au lieu de l'URL directe
    private static final String USER_SERVICE_NAME = "http://PLATFORMEBACK";

    /**
     * Récupérer l'ID du RH d'une entreprise depuis le microservice User
     */
    public Long getRhUserIdByCompanyId(Long companyId) {
        try {
            // Utiliser l'endpoint interne dédié aux microservices
            String url = USER_SERVICE_NAME + "/api/users/internal/company/" + companyId + "/rh";
            log.info("🔗 Calling User microservice via Eureka: {}", url);
            
            ResponseEntity<List<UserResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<UserResponse>>() {}
            );
            
            List<UserResponse> rhList = response.getBody();
            
            if (rhList != null && !rhList.isEmpty()) {
                Long rhUserId = rhList.get(0).idUser;
                log.info("✅ Found RH user_id={} for company_id={}", rhUserId, companyId);
                return rhUserId;
            }
            
            log.warn("⚠️ No RH found for company_id={}", companyId);
            return null;
            
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("❌ Cannot connect to User microservice (Eureka service: PLATFORMEBACK): {}", e.getMessage());
            return null;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("❌ HTTP error calling User microservice: {} - {}", e.getStatusCode(), e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("❌ Unexpected error calling User microservice for company_id={}: {} - {}", 
                companyId, e.getClass().getSimpleName(), e.getMessage());
            return null;
        }
    }

    /**
     * DTO pour la réponse du microservice User
     */
    public static class UserResponse {
        public Long idUser;
        public String email;
        public String role;
        public Long companyId;
    }
}
