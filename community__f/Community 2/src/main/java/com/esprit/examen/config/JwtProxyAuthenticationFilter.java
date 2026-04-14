package com.esprit.examen.config;

import com.esprit.examen.feign.UserFeignClient;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

@Component
public class JwtProxyAuthenticationFilter extends OncePerRequestFilter {

    private static final List<String> PUBLIC_PATH_PATTERNS = List.of(
        "/api-docs/**",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/actuator/**",
        "/api/notifications/**",
        "/api/community/notifications/**",
        "/notifications/**",
        "/community/notifications/**"
    );

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final UserFeignClient userFeignClient;

    public JwtProxyAuthenticationFilter(UserFeignClient userFeignClient) {
        this.userFeignClient = userFeignClient;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getServletPath();
        return PUBLIC_PATH_PATTERNS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() != null
            && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid Authorization header");
            return;
        }

        String token = authorization.substring(7).trim();
        if (token.isEmpty()) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing JWT token");
            return;
        }

        String normalizedAuthorization = "Bearer " + token;

        try {
            UserFeignClient.UserResponse user = userFeignClient.getMe(normalizedAuthorization);
            if (user == null || user.getIdUser() == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
                return;
            }

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                resolvePrincipal(user),
                null,
                resolveAuthorities(user.getRole())
            );

            authentication.setDetails(user);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);
        } catch (Exception ignored) {
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
        }
    }

    private Object resolvePrincipal(UserFeignClient.UserResponse user) {
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            return user.getEmail();
        }

        return String.valueOf(user.getIdUser());
    }

    private List<GrantedAuthority> resolveAuthorities(String rawRole) {
        String normalizedRole = rawRole == null ? "" : rawRole.trim().toUpperCase(Locale.ROOT);

        if (normalizedRole.isEmpty()) {
            return List.of();
        }

        return List.of(new SimpleGrantedAuthority("ROLE_" + normalizedRole));
    }
}
