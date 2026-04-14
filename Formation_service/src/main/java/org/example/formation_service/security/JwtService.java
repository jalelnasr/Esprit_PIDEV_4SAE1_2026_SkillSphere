package org.example.formation_service.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;

@Service
public class JwtService {

    private final Key key;

    public JwtService(@Value("${app.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String extractSubject(String token) {
        return parse(token).getBody().getSubject();
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
