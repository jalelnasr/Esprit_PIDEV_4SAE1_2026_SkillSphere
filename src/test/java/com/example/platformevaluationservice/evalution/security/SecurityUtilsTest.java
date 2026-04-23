package com.example.platformevaluationservice.evalution.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SecurityUtilsTest {

    private final SecurityUtils securityUtils = new SecurityUtils();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void currentUserIdShouldReadLongPrincipal() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(42L, null, List.of(new SimpleGrantedAuthority("ROLE_FORMATEUR")))
        );

        assertEquals(42L, securityUtils.currentUserId());
    }

    @Test
    void currentUserIdShouldParseNumericStringPrincipal() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("42", null, List.of(new SimpleGrantedAuthority("ROLE_FORMATEUR")))
        );

        assertEquals(42L, securityUtils.currentUserId());
    }

    @Test
    void currentUserIdShouldRejectEmailPrincipal() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("benzo@gmail.com", null, List.of(new SimpleGrantedAuthority("ROLE_FORMATEUR")))
        );

        assertThrows(ResponseStatusException.class, () -> securityUtils.currentUserId());
    }
}