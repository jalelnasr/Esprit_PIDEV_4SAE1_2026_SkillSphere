package org.example.platformeback.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.platformeback.user.dto.*;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserService userService;

    // ======================
    //  Everyone (connected)
    // ======================

    @GetMapping("/me")
    public UserResponse me(Authentication auth) {
        return userService.getMe(auth.getName());
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/me")
    public UserResponse updateMe(Authentication auth, @RequestBody UserUpdateRequest req) {
        return userService.updateMe(auth.getName(), req);
    }

    @PutMapping("/me/password")
    public void changePassword(Authentication auth, @RequestBody ChangePasswordRequest req) {
        userService.changeMyPassword(auth.getName(), req);
    }

    // ======================
    //  Admin only (CRUD)
    // ======================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin")
    public UserResponse adminCreate(@RequestBody AdminCreateUserRequest req) {
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
    @PutMapping("/admin/{id}/role")
    public UserResponse adminRole(@PathVariable Long id, @RequestParam Role role) {
        return userService.adminUpdateRole(id, role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/active")
    public UserResponse adminActive(@PathVariable Long id, @RequestParam Boolean active) {
        return userService.adminSetActive(id, active);
    }
}
