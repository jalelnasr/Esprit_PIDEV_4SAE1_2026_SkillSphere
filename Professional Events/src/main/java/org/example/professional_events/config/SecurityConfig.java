package org.example.professional_events.config;

import org.example.professional_events.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics (lecture)
                        .requestMatchers("/api/competitions", "/api/competitions/*/teams").permitAll()
                        // Endpoints protégés (écriture/modification)
                        .requestMatchers("/api/competitions/*/register", "/api/competitions/*/cancel", 
                                       "/api/competitions/teams/*/join", "/api/competitions/teams/*/leave",
                                       "/api/competitions/my-*", "/api/competitions/create", 
                                       "/api/competitions/*/manage", "/participants/**").authenticated()
                        .anyRequest().permitAll()
                )
                .formLogin(form -> form.disable())      // ← LIGNE AJOUTÉE
                .httpBasic(basic -> basic.disable())    // ← LIGNE AJOUTÉE
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}