package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.*;
import com.esprit.examen.entities.Role;
import com.esprit.examen.entities.User;
import com.esprit.examen.exceptions.BadRequestException;
import com.esprit.examen.exceptions.DuplicateResourceException;
import com.esprit.examen.exceptions.ResourceNotFoundException;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.services.UserService;
import lombok.RequiredArgsConstructor;
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
                u.getCreatedAt(),
                u.getTotalPoints(),
                u.getLevel(),
                u.getRank()
        );
    }

    private User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    // ---------- Everyone ----------

    @Override
    public UserResponse getMe(String email) {
        return toResponse(getByEmail(email));
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
            throw new BadRequestException("Old password incorrect");
        }
        u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(u);
    }

    // ---------- Admin ----------

    @Override
    public UserResponse adminCreateUser(AdminCreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new DuplicateResourceException("Email already exists");
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
                .totalPoints(0)
                .level(1)
                .rank("BEGINNER")
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
    public UserResponse adminUpdateUser(Long id, AdminUpdateUserRequest req) {
        User u = getById(id);
        if (req.email() != null && !req.email().isBlank()) {
            if (userRepository.existsByEmailAndIdUserNot(req.email(), id)) {
                throw new DuplicateResourceException("Email already exists");
            }
            u.setEmail(req.email());
        }
        if (req.nom() != null && !req.nom().isBlank()) u.setNom(req.nom());
        if (req.prenom() != null && !req.prenom().isBlank()) u.setPrenom(req.prenom());
        if (req.phone() != null) u.setPhone(req.phone());
        if (req.adresse() != null) u.setAdresse(req.adresse());
        return toResponse(userRepository.save(u));
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

    @Override
    public void adminResetPassword(Long id, AdminResetPasswordRequest req) {
        User u = getById(id);
        u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(u);
    }

    @Override
    public void adminDeleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }
}
