package org.example.b2bmodule.config;

import feign.Logger;
import feign.Request;
import feign.Retryer;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuration globale pour OpenFeign
 */
@Configuration
@Slf4j
public class FeignConfig {

    /**
     * Configuration des timeouts
     * - connectTimeout : Temps maximum pour établir la connexion
     * - readTimeout : Temps maximum pour lire la réponse
     */
    @Bean
    public Request.Options requestOptions() {
        return new Request.Options(
            5000, TimeUnit.MILLISECONDS,  // Connect timeout: 5 secondes
            10000, TimeUnit.MILLISECONDS, // Read timeout: 10 secondes
            true  // followRedirects
        );
    }

    /**
     * Configuration du retry (nouvelle tentative en cas d'échec)
     * - period : Délai entre chaque tentative
     * - maxPeriod : Délai maximum entre les tentatives
     * - maxAttempts : Nombre maximum de tentatives
     */
    @Bean
    public Retryer retryer() {
        return new Retryer.Default(
            100,   // Délai initial: 100ms
            1000,  // Délai maximum: 1 seconde
            3      // Maximum 3 tentatives
        );
    }

    /**
     * Niveau de logging pour Feign
     * - NONE : Pas de logs
     * - BASIC : Logs basiques (URL, méthode, code de réponse, temps d'exécution)
     * - HEADERS : BASIC + headers de requête et réponse
     * - FULL : HEADERS + body de requête et réponse
     */
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
    }

    /**
     * Gestion personnalisée des erreurs Feign
     */
    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            log.error("❌ Feign error calling {}: HTTP {} - {}", 
                methodKey, 
                response.status(), 
                response.reason()
            );
            
            // Retourner une exception personnalisée selon le code HTTP
            return switch (response.status()) {
                case 404 -> new RuntimeException("Resource not found in PlatformeBack");
                case 500 -> new RuntimeException("Internal server error in PlatformeBack");
                case 503 -> new RuntimeException("PlatformeBack service unavailable");
                default -> new RuntimeException("Error calling PlatformeBack: " + response.reason());
            };
        };
    }
}
