package org.example.platformeback.auth.service;

import org.example.platformeback.auth.dto.AuthResponse;
import org.example.platformeback.auth.dto.LoginRequest;
import org.example.platformeback.auth.dto.RegisterRequest;
import org.example.platformeback.security.JwtService;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.model.User;
import org.example.platformeback.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .idUser(8L)
                .nom("aziz")
                .prenom("aziz")
                .email("aziz@gmail.com")
                .passwordHash("$2a$10$encoded")
                .role(Role.FORMATEUR)
                .isActive(true)
                .build();
    }

    // ===== REGISTER =====

    @Test
    void register_shouldCreateUserAndReturnToken() {
        RegisterRequest req = new RegisterRequest("aziz", "aziz", "aziz@gmail.com", "azizaziz", null, null);

        when(userRepository.existsByEmail("aziz@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("azizaziz")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(anyString(), any(), anyString())).thenReturn("jwt-token");

        AuthResponse result = authService.register(req);

        assertNotNull(result);
        assertEquals("jwt-token", result.token());
        assertEquals("aziz@gmail.com", result.email());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldForceRoleToAPPRENANT() {
        RegisterRequest req = new RegisterRequest("ahmed", "ali", "ahmed@gmail.com", "password123", null, null);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            assertEquals(Role.APPRENANT, u.getRole());
            return user;
        });
        when(jwtService.generateToken(anyString(), any(), anyString())).thenReturn("token");

        authService.register(req);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldSetIsActiveTrue() {
        RegisterRequest req = new RegisterRequest("test", "user", "test@gmail.com", "password123", null, null);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            assertTrue(u.getIsActive());
            return user;
        });
        when(jwtService.generateToken(anyString(), any(), anyString())).thenReturn("token");

        authService.register(req);
    }

    @Test
    void register_shouldThrowWhenEmailAlreadyExists() {
        RegisterRequest req = new RegisterRequest("aziz", "aziz", "aziz@gmail.com", "azizaziz", null, null);
        when(userRepository.existsByEmail("aziz@gmail.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(req));
        assertEquals("Email already exists", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_shouldEncodePassword() {
        RegisterRequest req = new RegisterRequest("test", "user", "test@gmail.com", "plainpassword", null, null);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("plainpassword")).thenReturn("$2a$encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            assertEquals("$2a$encoded", u.getPasswordHash());
            return user;
        });
        when(jwtService.generateToken(anyString(), any(), anyString())).thenReturn("token");

        authService.register(req);
        verify(passwordEncoder).encode("plainpassword");
    }

    // ===== LOGIN =====

    @Test
    void login_shouldAuthenticateAndReturnToken() {
        LoginRequest req = new LoginRequest("aziz@gmail.com", "azizaziz");

        when(userRepository.findByEmail("aziz@gmail.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(anyString(), any(), anyString())).thenReturn("jwt-token");

        AuthResponse result = authService.login(req);

        assertNotNull(result);
        assertEquals("jwt-token", result.token());
        assertEquals(Role.FORMATEUR, result.role());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_shouldIncludeUserIdAndRoleInToken() {
        LoginRequest req = new LoginRequest("aziz@gmail.com", "azizaziz");
        when(userRepository.findByEmail("aziz@gmail.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken("aziz@gmail.com", 8L, "FORMATEUR")).thenReturn("token-with-claims");

        AuthResponse result = authService.login(req);

        assertEquals(8L, result.idUser());
        verify(jwtService).generateToken("aziz@gmail.com", 8L, "FORMATEUR");
    }

    @Test
    void login_shouldThrowWhenUserNotFound() {
        LoginRequest req = new LoginRequest("unknown@gmail.com", "password");
        when(userRepository.findByEmail("unknown@gmail.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(req));
    }

    @Test
    void login_shouldReturnCorrectUserInfo() {
        LoginRequest req = new LoginRequest("aziz@gmail.com", "azizaziz");
        when(userRepository.findByEmail("aziz@gmail.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(anyString(), any(), anyString())).thenReturn("token");

        AuthResponse result = authService.login(req);

        assertEquals("aziz", result.nom());
        assertEquals("aziz", result.prenom());
        assertEquals("aziz@gmail.com", result.email());
    }
}
