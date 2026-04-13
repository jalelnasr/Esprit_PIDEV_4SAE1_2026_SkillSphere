package org.example.platformeback.config;

import lombok.RequiredArgsConstructor;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.model.User;
import org.example.platformeback.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(2) // S'exécute APRÈS DatabaseMigration
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // ✅ If an ADMIN already exists, do nothing
        if (userRepository.existsByRole(Role.ADMIN)) return;

        // ✅ Create the first admin automatically
        User admin = User.builder()
                .nom("Root")
                .prenom("Admin")
                .email("admin@gmail.com")
                .passwordHash(passwordEncoder.encode("Admin123"))
                .role(Role.ADMIN)
                .isActive(true)
                .build();

        userRepository.save(admin);

        System.out.println("✅ Default admin created: admin@sgmail.com / Admin123");
    }
}