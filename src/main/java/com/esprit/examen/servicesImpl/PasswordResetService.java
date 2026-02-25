package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.ForgotPasswordRequest;
import com.esprit.examen.dto.ResetPasswordRequest;
import com.esprit.examen.entities.PasswordResetToken;
import com.esprit.examen.entities.User;
import com.esprit.examen.repositories.PasswordResetTokenRepository;
import com.esprit.examen.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        if (req == null || req.email() == null) return;

        String email = req.email().trim();
        if (email.isBlank()) return;

        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            tokenRepo.revokeAllActiveByUser(user);

            String token = UUID.randomUUID().toString();

            PasswordResetToken prt = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .used(false)
                    .build();

            tokenRepo.save(prt);

            System.out.println("\n================ FORGOT PASSWORD ================");
            System.out.println("Reset link for: " + user.getEmail());
            System.out.println("http://localhost:4200/auth/reset-password?token=" + token);
            System.out.println("=================================================\n");
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        if (req == null || req.token() == null || req.token().isBlank()) {
            throw new RuntimeException("Token is required");
        }
        if (req.newPassword() == null || req.newPassword().length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters");
        }

        PasswordResetToken token = tokenRepo.findByToken(req.token())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (Boolean.TRUE.equals(token.getUsed())) {
            throw new RuntimeException("Token already used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        token.setUsed(true);
        tokenRepo.save(token);
    }
}
