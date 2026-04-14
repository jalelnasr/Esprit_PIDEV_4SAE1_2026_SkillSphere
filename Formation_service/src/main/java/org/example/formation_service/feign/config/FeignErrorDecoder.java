package org.example.formation_service.feign.config;

import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.feign.exception.UserNotFoundException;

/**
 * Custom Feign error decoder.
 * Converts HTTP error responses from PLATFORMEBACK into typed exceptions.
 * 
 * - 404 → UserNotFoundException (handled gracefully in services)
 * - Other errors → default Feign exception (triggers fallback if circuit breaker enabled)
 */
@Slf4j
public class FeignErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        log.warn("⚠️ [Feign] Error {} on method: {}", response.status(), methodKey);

        if (response.status() == 404) {
            // User not found — return typed exception so services can handle gracefully
            return new UserNotFoundException("User not found (404) — method: " + methodKey);
        }

        if (response.status() == 401 || response.status() == 403) {
            log.error("🔒 [Feign] Auth error {} — check X-API-KEY header", response.status());
        }

        return defaultDecoder.decode(methodKey, response);
    }
}
