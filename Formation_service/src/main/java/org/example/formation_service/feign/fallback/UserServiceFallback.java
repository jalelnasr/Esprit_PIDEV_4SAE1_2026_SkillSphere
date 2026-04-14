package org.example.formation_service.feign.fallback;

import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.feign.UserServiceClient;
import org.example.formation_service.feign.dto.UserDto;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UserServiceFallback implements UserServiceClient {

    @Override
    public UserDto getUserById(Long userId, String apiKey) {
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
    public Boolean userExists(Long userId, String apiKey) {
        log.warn("⚠️ [Feign Fallback] UserService unavailable — assuming user {} exists", userId);
        return true;
    }
}
