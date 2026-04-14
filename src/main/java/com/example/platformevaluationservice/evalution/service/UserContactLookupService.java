package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.internal.UserContactDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserContactLookupService {

    private final RestTemplate restTemplate;

    @Value("${user.service.base-url:http://localhost:8085}")
    private String userServiceBaseUrl;

    @Value("${user.service.api-key:formation-to-user-secret}")
    private String userServiceApiKey;

    public Optional<UserContactDto> findUserContact(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }

        String url = userServiceBaseUrl + "/internal/users/" + userId + "/contact";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-API-KEY", userServiceApiKey);

        try {
            ResponseEntity<UserContactDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    UserContactDto.class
            );

            return Optional.ofNullable(response.getBody());
        } catch (Exception ex) {
            log.warn("Unable to fetch contact for userId {} from user service: {}", userId, ex.getMessage());
            return Optional.empty();
        }
    }
}
