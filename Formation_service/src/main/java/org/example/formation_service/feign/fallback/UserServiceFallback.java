package org.example.formation_service.feign.fallback;

import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.feign.UserServiceClient;
import org.example.formation_service.feign.dto.UserDto;
import org.springframework.stereotype.Component;

/**
 * Fallback implementation for UserServiceClient.
 * Called automatically when PLATFORMEBACK is unreachable or returns an error.
 * Ensures Formation Service stays functional even when User Service is down.
 */
@Component
@Slf4j
public class UserServiceFallback implements UserServiceClient {

    @Override
    public UserDto getUserById(Long userId) {
        log.warn("⚠️ [Feign Fallback] UserService unavailable — returning placeholder for userId={}", userId);
        return UserDto.builder()
            .idUser(userId)
            .nom("Utilisateur")
            .prenom("#" + userId)
            .email("user" + userId + "@skillsphere.com")
            .role("APPRENANT")
            .isActive(true)
            .build();
    }

    @Override
    public Boolean userExists(Long userId) {
        log.warn("⚠️ [Feign Fallback] UserService unavailable — assuming user {} exists", userId);
        return true; // Fail-open: assume user exists to avoid blocking operations
    }
}
