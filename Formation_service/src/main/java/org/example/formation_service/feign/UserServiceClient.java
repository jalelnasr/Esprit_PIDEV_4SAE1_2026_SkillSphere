package org.example.formation_service.feign;

import org.example.formation_service.feign.config.FeignConfig;
import org.example.formation_service.feign.dto.UserDto;
import org.example.formation_service.feign.fallback.UserServiceFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Feign client for inter-service communication with PLATFORMEBACK (User Service).
 * Uses the /internal/** endpoints which are protected by API key (not JWT).
 * 
 * Error handling:
 * - 404 → FeignErrorDecoder throws UserNotFoundException → caught in services
 * - Network error → fallback returns placeholder data
 */
@FeignClient(
    name = "PLATFORMEBACK",
    fallback = UserServiceFallback.class,
    configuration = FeignConfig.class
)
public interface UserServiceClient {

    /**
     * Get user info by ID via internal endpoint (API key protected).
     * Maps to GET /internal/users/{id} on PLATFORMEBACK.
     */
    @GetMapping("/internal/users/{id}")
    UserDto getUserById(
        @PathVariable("id") Long userId,
        @RequestHeader("X-API-KEY") String apiKey
    );

    /**
     * Check if a user exists via internal endpoint (API key protected).
     * Maps to GET /internal/users/{id}/exists on PLATFORMEBACK.
     */
    @GetMapping("/internal/users/{id}/exists")
    Boolean userExists(
        @PathVariable("id") Long userId,
        @RequestHeader("X-API-KEY") String apiKey
    );
}
