package org.example.formation_service.feign;

import org.example.formation_service.feign.dto.UserDto;
import org.example.formation_service.feign.fallback.UserServiceFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for inter-service communication with PLATFORMEBACK (User Service).
 * Registered in Eureka as "PLATFORMEBACK", accessible via API Gateway.
 *
 * Used to enrich Formation Service responses with real user data
 * (name, email) instead of placeholder values.
 */
@FeignClient(
    name = "PLATFORMEBACK",
    fallback = UserServiceFallback.class
)
public interface UserServiceClient {

    /**
     * Get user info by ID — internal endpoint, protected by API key.
     * Maps to GET /api/users/internal/{id} on PLATFORMEBACK.
     */
    @GetMapping("/api/users/internal/{id}")
    UserDto getUserById(@PathVariable("id") Long userId);

    /**
     * Check if a user exists — used before enrollment operations.
     * Maps to GET /api/users/internal/{id}/exists on PLATFORMEBACK.
     */
    @GetMapping("/api/users/internal/{id}/exists")
    Boolean userExists(@PathVariable("id") Long userId);
}
