package org.example.b2bmodule.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * Intercepteur pour propager le token JWT lors des appels inter-microservices
 */
@Component
@Slf4j
public class AuthTokenInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest httpRequest = attributes.getRequest();
            String authHeader = httpRequest.getHeader("Authorization");
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                request.getHeaders().add("Authorization", authHeader);
                log.debug("🔑 Token JWT propagé vers: {}", request.getURI());
            } else {
                log.warn("⚠️ Aucun token JWT trouvé dans la requête pour: {}", request.getURI());
            }
        } else {
            log.warn("⚠️ Pas de contexte de requête disponible pour: {}", request.getURI());
        }
        
        return execution.execute(request, body);
    }
}
