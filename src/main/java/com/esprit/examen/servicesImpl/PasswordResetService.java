package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.ForgotPasswordRequest;
import com.esprit.examen.dto.ResetPasswordRequest;
import com.esprit.examen.entities.PasswordResetToken;
import com.esprit.examen.entities.User;
import com.esprit.examen.exceptions.BadRequestException;
import com.esprit.examen.exceptions.ResourceNotFoundException;
import com.esprit.examen.repositories.PasswordResetTokenRepository;
import com.esprit.examen.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
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

            log.info("Password reset token generated for user: {}", user.getEmail());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken token = tokenRepo.findByToken(req.token())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid token"));

        if (Boolean.TRUE.equals(token.getUsed())) {
            throw new BadRequestException("Token already used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Token expired");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        token.setUsed(true);
        tokenRepo.save(token);
    }
}
