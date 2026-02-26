package com.esprit.examen.controllers;

import com.esprit.examen.dto.*;
import com.esprit.examen.entities.Role;
import com.esprit.examen.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ======================
    //  Everyone (connected)
    // ======================

    @GetMapping("/me")
    public UserResponse me(Authentication auth) {
        return userService.getMe(auth.getName());
    }

    @PutMapping("/me")
    public UserResponse updateMe(Authentication auth, @Valid @RequestBody UserUpdateRequest req) {
        return userService.updateMe(auth.getName(), req);
    }

    @PutMapping("/me/password")
    public void changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest req) {
        userService.changeMyPassword(auth.getName(), req);
    }

    // ======================
    //  Admin only (CRUD)
    // ======================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin")
    public UserResponse adminCreate(@Valid @RequestBody AdminCreateUserRequest req) {
        return userService.adminCreateUser(req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public List<UserResponse> adminList() {
        return userService.adminListUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{id}")
    public UserResponse adminGet(@PathVariable Long id) {
        return userService.adminGetUser(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}")
    public UserResponse adminUpdate(@PathVariable Long id, @Valid @RequestBody AdminUpdateUserRequest req) {
        return userService.adminUpdateUser(id, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/role")
    public UserResponse adminRole(@PathVariable Long id, @RequestParam Role role) {
        return userService.adminUpdateRole(id, role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/active")
    public UserResponse adminActive(@PathVariable Long id, @RequestParam Boolean active) {
        return userService.adminSetActive(id, active);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/password")
    public void adminResetPassword(@PathVariable Long id, @Valid @RequestBody AdminResetPasswordRequest req) {
        userService.adminResetPassword(id, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/{id}")
    public void adminDelete(@PathVariable Long id) {
        userService.adminDeleteUser(id);
    }
}
