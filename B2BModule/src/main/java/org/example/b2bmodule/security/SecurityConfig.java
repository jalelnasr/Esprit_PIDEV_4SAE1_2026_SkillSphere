package org.example.b2bmodule.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuration Spring Security pour B2BModule
 * 
 * Stratégie :
 * - Stateless (pas de session, JWT uniquement)
 * - Endpoints publics : Swagger, Actuator, Test
 * - Endpoints protégés : Tous les autres (nécessitent JWT)
 * - Autorisation par rôle via @PreAuthorize sur les controllers
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Active @PreAuthorize, @Secured, etc.
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Désactiver CSRF (pas nécessaire pour API REST stateless)
                .csrf(AbstractHttpConfigurer::disable)
                
                // Configuration des autorisations
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics (pas de JWT requis)
                        .requestMatchers(
                                "/api/b2b/test/**",           // Endpoints de test
                                "/api/b2b/diagnostic/**",     // Diagnostic
                                "/swagger-ui/**",             // Swagger UI
                                "/v3/api-docs/**",            // OpenAPI docs
                                "/swagger-ui.html",           // Swagger HTML
                                "/actuator/**"                // Actuator (monitoring)
                        ).permitAll()
                        
                        // Tous les autres endpoints nécessitent une authentification
                        .anyRequest().authenticated()
                )
                
                // Stateless : pas de session HTTP
                .sessionManagement(session -> 
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // Ajouter le filtre JWT avant le filtre d'authentification standard
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
