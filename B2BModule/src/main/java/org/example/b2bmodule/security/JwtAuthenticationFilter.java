package org.example.b2bmodule.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtre JWT pour intercepter toutes les requêtes et valider le token
 * 
 * Ce filtre :
 * 1. Extrait le token JWT du header Authorization
 * 2. Valide le token
 * 3. Extrait les informations (email, rôle)
 * 4. Crée l'authentification Spring Security
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Extraire le header Authorization
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("⚠️ No JWT token found in request to {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 2. Extraire le token (enlever "Bearer ")
            final String jwt = authHeader.substring(7);
            
            // 3. Extraire l'email du token
            final String userEmail = jwtService.extractEmail(jwt);
            
            // 4. Si l'email existe et qu'il n'y a pas déjà d'authentification
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // 5. Valider le token
                if (jwtService.isTokenValid(jwt, userEmail)) {
                    
                    // 6. Extraire le rôle
                    String role = jwtService.extractRole(jwt);
                    
                    // 7. Créer l'authentification Spring Security
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userEmail,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 8. Définir l'authentification dans le contexte Spring Security
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.debug("✅ JWT validated for user: {} with role: {}", userEmail, role);
                } else {
                    log.warn("⚠️ Invalid JWT token for user: {}", userEmail);
                }
            }
            
        } catch (Exception e) {
            log.error("❌ JWT authentication error: {}", e.getMessage());
        }

        // 9. Continuer la chaîne de filtres
        filterChain.doFilter(request, response);
    }
}
