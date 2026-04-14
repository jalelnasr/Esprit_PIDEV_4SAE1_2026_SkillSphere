package org.example.formation_service.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI / Swagger configuration for Formation Service.
 * Accessible at: http://localhost:8086/swagger-ui.html
 * Via API Gateway: http://localhost:8087/formation-service/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI formationServiceOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("SkillSphere — Formation Service API")
                .description("""
                    API REST du module de formation de la plateforme SkillSphere.
                    
                    ## Fonctionnalités
                    - **Formations** : CRUD, publication, gestion du contenu
                    - **Inscriptions** : Contrôle d'accès par abonnement, limites mensuelles
                    - **Abonnements** : Plans Basic / Plus / Premium avec paiement OTP
                    - **Quiz** : Création, tentatives, scores
                    - **Progression** : Suivi des leçons par apprenant
                    - **Meets virtuels** : Calendrier Jitsi pour formateurs et apprenants
                    - **Avis** : Système de notation avec modération de contenu
                    - **Statistiques** : Dashboard instructeur avec tendances d'inscription
                    
                    ## Authentification
                    Utiliser le bouton **Authorize** et entrer : `Bearer <votre_token_JWT>`
                    """)
                .version("2.0.0")
                .contact(new Contact()
                    .name("SkillSphere Team")
                    .email("contact@skillsphere.com"))
                .license(new License()
                    .name("Projet académique — Sprint 2")
                    .url("https://github.com/skillsphere")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:8086")
                    .description("Formation Service direct"),
                new Server()
                    .url("http://localhost:8087/formation-service")
                    .description("Via API Gateway (recommandé)")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .name("bearerAuth")
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Token JWT obtenu via /api/auth/login sur le User Service (port 8085)")));
    }
}
