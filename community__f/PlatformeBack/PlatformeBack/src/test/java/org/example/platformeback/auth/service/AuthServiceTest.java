package org.example.platformeback.auth.service;

import org.example.platformeback.auth.dto.AuthResponse;
import org.example.platformeback.auth.dto.LoginRequest;
import org.example.platformeback.auth.dto.RegisterRequest;
import org.example.platformeback.security.JwtService;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.model.User;
import org.example.platformeback.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_assignsDefaultUserRoleAndReturnsToken() {
        RegisterRequest request = new RegisterRequest("Doe", "Jane", "jane@example.com", "password123", null, null);

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setIdUser(100L);
            return user;
        });
        when(jwtService.generateToken("jane@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertEquals(100L, response.idUser());
        assertEquals("jwt-token", response.token());
        assertEquals(Role.APPRENANT, response.role());
    }

    @Test
    void login_authenticatesAndReturnsJwtPayload() {
        LoginRequest request = new LoginRequest("admin@example.com", "secret");

        User user = User.builder()
            .idUser(1L)
            .nom("Admin")
            .prenom("User")
            .email("admin@example.com")
            .passwordHash("encoded")
            .role(Role.ADMIN)
            .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken("admin@example.com")).thenReturn("admin-token");

        AuthResponse response = authService.login(request);

        assertEquals("admin-token", response.token());
        assertEquals(Role.ADMIN, response.role());
    }
}
