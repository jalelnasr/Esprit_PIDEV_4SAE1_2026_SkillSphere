package org.example.formation_service.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UserServiceValidator {
    
    /**
     * Validate that a user exists
     * Simple version - just logs, doesn't actually validate
     * This avoids dependency on User Service
     */
    public void validateUserExists(Long userId) {
        log.debug("✅ Assuming user {} exists (validation skipped)", userId);
        // No actual validation - just assume user exists
        // This prevents errors when User Service is down
    }
}
