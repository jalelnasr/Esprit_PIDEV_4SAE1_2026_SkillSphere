package com.esprit.examen.config;

import com.esprit.examen.entities.Role;
import com.esprit.examen.entities.User;
import com.esprit.examen.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(1)
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${gamix.admin.email}")
    private String adminEmail;

    @Value("${gamix.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ADMIN)) return;

        User admin = User.builder()
                .nom("Root")
                .prenom("Admin")
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .isActive(true)
                .totalPoints(0)
                .level(1)
                .rank("BEGINNER")
                .build();

        userRepository.save(admin);
        log.info("Default admin account created");
    }
}
