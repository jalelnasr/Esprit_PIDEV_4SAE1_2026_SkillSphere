package org.example.platformeback.auth.service;

import lombok.RequiredArgsConstructor;
import org.example.platformeback.auth.dto.*;
import org.example.platformeback.security.JwtService;
import org.example.platformeback.user.model.User;
import org.example.platformeback.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmailIgnoreCase(req.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = User.builder()
                .nom(req.nom())
                .prenom(req.prenom())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(org.example.platformeback.user.model.Role.APPRENANT) // FORCE
                .phone(req.phone())
                .adresse(req.adresse())
                .isActive(true) // FORCE
                .build();

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved);

        return new AuthResponse(
                token,
                saved.getIdUser(),
                saved.getNom(),
                saved.getPrenom(),
                saved.getEmail(),
                saved.getRole()
        );
    }
    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getIdUser(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole()
        );
    }
}
