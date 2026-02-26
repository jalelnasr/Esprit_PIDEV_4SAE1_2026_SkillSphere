package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.AuthResponse;
import com.esprit.examen.dto.LoginRequest;
import com.esprit.examen.dto.RegisterRequest;
import com.esprit.examen.entities.Role;
import com.esprit.examen.entities.User;
import com.esprit.examen.exceptions.DuplicateResourceException;
import com.esprit.examen.exceptions.ResourceNotFoundException;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = User.builder()
                .nom(req.nom())
                .prenom(req.prenom())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(Role.APPRENANT)
                .phone(req.phone())
                .adresse(req.adresse())
                .isActive(true)
                .totalPoints(0)
                .level(1)
                .rank("BEGINNER")
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getEmail());

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
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(user.getEmail());

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
