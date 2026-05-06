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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
    void registerShouldCreateLearnerAndReturnToken() {
        RegisterRequest request = new RegisterRequest(
                "Ben",
                "Zo",
                "benzo@gmail.com",
                "secret",
                null,
                null
        );

        when(userRepository.findByEmailIgnoreCase("benzo@gmail.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secret")).thenReturn("hashed-secret");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setIdUser(7L);
            return user;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals(Role.APPRENANT, savedUser.getRole());
        assertEquals(true, savedUser.getIsActive());
        assertEquals("hashed-secret", savedUser.getPasswordHash());

        assertEquals("jwt-token", response.token());
        assertEquals(7L, response.idUser());
        assertEquals("benzo@gmail.com", response.email());
        assertEquals(Role.APPRENANT, response.role());
    }

    @Test
    void registerShouldRejectExistingEmail() {
        RegisterRequest request = new RegisterRequest(
                "Ben",
                "Zo",
                "benzo@gmail.com",
                "secret",
                null,
                null
        );

        when(userRepository.findByEmailIgnoreCase("benzo@gmail.com")).thenReturn(Optional.of(new User()));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.register(request)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void loginShouldReturnUnauthorizedWhenAuthenticationFails() {
        LoginRequest request = new LoginRequest("benzo@gmail.com", "bad-password");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad credentials"));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.login(request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void loginShouldAuthenticateAndReturnToken() {
        LoginRequest request = new LoginRequest("benzo@gmail.com", "secret");

        User user = User.builder()
                .idUser(7L)
                .nom("Ben")
                .prenom("Zo")
                .email("benzo@gmail.com")
                .passwordHash("hashed")
                .role(Role.FORMATEUR)
                .isActive(true)
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("benzo@gmail.com", "secret"));
        when(userRepository.findByEmailIgnoreCase("benzo@gmail.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-login-token");

        AuthResponse response = authService.login(request);

        assertEquals("jwt-login-token", response.token());
        assertEquals(7L, response.idUser());
        assertEquals(Role.FORMATEUR, response.role());
    }
}
