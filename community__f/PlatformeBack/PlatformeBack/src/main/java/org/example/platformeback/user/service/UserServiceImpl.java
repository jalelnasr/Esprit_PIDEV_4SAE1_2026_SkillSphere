package org.example.platformeback.user.service;

import lombok.RequiredArgsConstructor;
import org.example.platformeback.user.dto.*;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.model.User;
import org.example.platformeback.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getIdUser(),
                u.getNom(),
                u.getPrenom(),
                u.getEmail(),
                u.getRole(),
                u.getPhone(),
                u.getAdresse(),
                u.getIsActive(),
                u.getCreatedAt()
        );
    }

    private User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ---------- Everyone ----------
    @Override
    public UserResponse getMe(String email) {
        return toResponse(getByEmail(email));
    }

    @Override
    public UserResponse getUserById(Long id) {
        return toResponse(getById(id));
    }

    @Override
    public UserResponse updateMe(String email, UserUpdateRequest req) {
        User u = getByEmail(email);

        if (req.nom() != null) u.setNom(req.nom());
        if (req.prenom() != null) u.setPrenom(req.prenom());
        if (req.phone() != null) u.setPhone(req.phone());
        if (req.adresse() != null) u.setAdresse(req.adresse());

        return toResponse(userRepository.save(u));
    }

    @Override
    public void changeMyPassword(String email, ChangePasswordRequest req) {
        User u = getByEmail(email);

        if (!passwordEncoder.matches(req.oldPassword(), u.getPasswordHash())) {
            throw new RuntimeException("Old password incorrect");
        }

        if (req.newPassword() == null || req.newPassword().length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters");
        }

        u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(u);
    }

    // ---------- Admin ----------
    @Override
    public UserResponse adminCreateUser(AdminCreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new RuntimeException("Email already exists");
        }

        if (req.password() == null || req.password().length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters");
        }

        Role role = (req.role() != null) ? req.role() : Role.APPRENANT;

        User u = User.builder()
                .nom(req.nom())
                .prenom(req.prenom())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(role)
                .phone(req.phone())
                .adresse(req.adresse())
                .isActive(req.isActive() != null ? req.isActive() : true)
                .build();

        return toResponse(userRepository.save(u));
    }

    @Override
    public List<UserResponse> adminListUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public UserResponse adminGetUser(Long id) {
        return toResponse(getById(id));
    }

    @Override
    public UserResponse adminUpdateRole(Long id, Role role) {
        User u = getById(id);
        u.setRole(role);
        return toResponse(userRepository.save(u));
    }

    @Override
    public UserResponse adminSetActive(Long id, Boolean active) {
        User u = getById(id);
        u.setIsActive(active);
        return toResponse(userRepository.save(u));
    }
}
