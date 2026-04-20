package org.example.professional_events.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * ⭐ Configuration pour RestTemplate
 * 
 * Ajouter cette classe dans Professional Events pour permettre
 * les appels REST vers PlatformeBack
 * 
 * Emplacement: src/main/java/org/example/professional_events/config/RestTemplateConfig.java
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
