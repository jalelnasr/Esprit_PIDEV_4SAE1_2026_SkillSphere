package org.example.platformeback.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.model.User;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "THIS_IS_A_VERY_LONG_SECRET_KEY_CHANGE_ME_1234567890_ABCDEFG";

    @Test
    void generateTokenShouldIncludeSubjectAndClaims() {
        JwtService jwtService = new JwtService(SECRET, 60_000L);

        User user = User.builder()
                .idUser(42L)
                .email("benzo@gmail.com")
                .role(Role.FORMATEUR)
                .build();

        String token = jwtService.generateToken(user);

        assertTrue(jwtService.isTokenValid(token));
        assertEquals("benzo@gmail.com", jwtService.extractSubject(token));

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertEquals(42, claims.get("userId", Number.class).intValue());
        assertEquals("FORMATEUR", claims.get("role", String.class));
        assertEquals(List.of("FORMATEUR"), claims.get("roles", List.class));
    }

    @Test
    void isTokenValidShouldReturnFalseForTamperedToken() {
        JwtService jwtService = new JwtService(SECRET, 60_000L);

        User user = User.builder()
                .idUser(7L)
                .email("user@example.com")
                .role(Role.APPRENANT)
                .build();

        String token = jwtService.generateToken(user);
        String tampered = token + "tampered";

        assertFalse(jwtService.isTokenValid(tampered));
    }
}
