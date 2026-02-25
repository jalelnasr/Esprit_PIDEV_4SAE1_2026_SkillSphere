package com.esprit.examen.config;

import com.esprit.examen.entities.Role;
import com.esprit.examen.entities.User;
import com.esprit.examen.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ADMIN)) return;

        User admin = User.builder()
                .nom("Root")
                .prenom("Admin")
                .email("admin@gmail.com")
                .passwordHash(passwordEncoder.encode("Admin123"))
                .role(Role.ADMIN)
                .isActive(true)
                .totalPoints(0)
                .level(1)
                .rank("BEGINNER")
                .build();

        userRepository.save(admin);
        System.out.println("Default admin created: admin@gmail.com / Admin123");
    }
}
