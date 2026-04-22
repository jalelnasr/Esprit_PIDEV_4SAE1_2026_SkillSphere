package org.example.formation_service.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Allow preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public endpoints
                        .requestMatchers("/api/courses/public/**").permitAll()
                        .requestMatchers("/api/subscription-plans").permitAll()
                        .requestMatchers("/api/subscription-plans/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Static uploaded files - publicly accessible
                        .requestMatchers("/uploads/**").permitAll()
                        // Admin only
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Instructor endpoints (FORMATEUR = INSTRUCTOR)
                        .requestMatchers(HttpMethod.POST, "/api/courses").hasAnyRole("FORMATEUR", "INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("FORMATEUR", "INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("FORMATEUR", "INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/publish").hasAnyRole("FORMATEUR", "INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/unpublish").hasAnyRole("FORMATEUR", "INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/lessons").hasAnyRole("FORMATEUR", "INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/sessions").hasAnyRole("FORMATEUR", "INSTRUCTOR", "ADMIN")
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
