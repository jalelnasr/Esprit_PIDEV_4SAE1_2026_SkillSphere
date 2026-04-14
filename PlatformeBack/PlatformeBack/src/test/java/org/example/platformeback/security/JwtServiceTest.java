package org.example.platformeback.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private static final String SECRET = "THIS_IS_A_VERY_LONG_SECRET_KEY_CHANGE_ME_1234567890_ABCDEFG";
    private static final long EXPIRATION = 86400000L; // 24h

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, EXPIRATION);
    }

    // ===== GENERATE TOKEN =====

    @Test
    void generateToken_shouldReturnNonNullToken() {
        String token = jwtService.generateToken("aziz@gmail.com", 8L, "FORMATEUR");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void generateToken_shouldContainThreeParts() {
        String token = jwtService.generateToken("aziz@gmail.com", 8L, "FORMATEUR");
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length); // header.payload.signature
    }

    // ===== EXTRACT SUBJECT =====

    @Test
    void extractSubject_shouldReturnEmail() {
        String token = jwtService.generateToken("aziz@gmail.com", 8L, "FORMATEUR");
        assertEquals("aziz@gmail.com", jwtService.extractSubject(token));
    }

    // ===== EXTRACT USER ID =====

    @Test
    void extractUserId_shouldReturnCorrectId() {
        String token = jwtService.generateToken("aziz@gmail.com", 8L, "FORMATEUR");
        assertEquals(8L, jwtService.extractUserId(token));
    }

    @Test
    void extractUserId_shouldReturnNullWhenNotPresent() {
        String token = jwtService.generateToken("aziz@gmail.com"); // sans userId
        assertNull(jwtService.extractUserId(token));
    }

    // ===== EXTRACT ROLE =====

    @Test
    void extractRole_shouldReturnCorrectRole() {
        String token = jwtService.generateToken("aziz@gmail.com", 8L, "FORMATEUR");
        assertEquals("FORMATEUR", jwtService.extractRole(token));
    }

    @Test
    void extractRole_shouldReturnAPPRENANT() {
        String token = jwtService.generateToken("ahmed@gmail.com", 11L, "APPRENANT");
        assertEquals("APPRENANT", jwtService.extractRole(token));
    }

    // ===== IS TOKEN VALID =====

    @Test
    void isTokenValid_shouldReturnTrueForValidToken() {
        String token = jwtService.generateToken("aziz@gmail.com", 8L, "FORMATEUR");
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void isTokenValid_shouldReturnFalseForInvalidToken() {
        assertFalse(jwtService.isTokenValid("invalid.token.here"));
    }

    @Test
    void isTokenValid_shouldReturnFalseForEmptyToken() {
        assertFalse(jwtService.isTokenValid(""));
    }

    @Test
    void isTokenValid_shouldReturnFalseForTamperedToken() {
        String token = jwtService.generateToken("aziz@gmail.com", 8L, "FORMATEUR");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertFalse(jwtService.isTokenValid(tampered));
    }

    // ===== DIFFERENT USERS =====

    @Test
    void generateToken_differentUsersHaveDifferentTokens() {
        String token1 = jwtService.generateToken("aziz@gmail.com", 8L, "FORMATEUR");
        String token2 = jwtService.generateToken("ahmed@gmail.com", 11L, "APPRENANT");
        assertNotEquals(token1, token2);
    }
}
