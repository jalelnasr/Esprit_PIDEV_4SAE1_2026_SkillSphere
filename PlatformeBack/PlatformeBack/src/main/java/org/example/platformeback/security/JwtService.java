package org.example.platformeback.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final Key key;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    // Méthode originale pour compatibilité
    public String generateToken(String subject) {
        return generateToken(subject, null, null);
    }

    // Nouvelle méthode avec userId et role pour les microservices
    public String generateToken(String subject, Long userId, String role) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        Map<String, Object> claims = new HashMap<>();
        if (userId != null) {
            claims.put("userId", userId);
        }
        if (role != null) {
            claims.put("role", role);
        }

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) // email
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractSubject(String token) {
        return parse(token).getBody().getSubject();
    }

    public Long extractUserId(String token) {
        Claims claims = parse(token).getBody();
        return claims.get("userId", Long.class);
    }

    public String extractRole(String token) {
        Claims claims = parse(token).getBody();
        return claims.get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }
}
