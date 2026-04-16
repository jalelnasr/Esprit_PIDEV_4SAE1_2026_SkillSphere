package org.example.platformeback.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.platformeback.user.dto.UserResponse;
import org.example.platformeback.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal endpoints for service-to-service communication (no auth required).
 * Used by GAMIX-SERVICE via Feign client.
 */
@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.adminGetUser(id));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.adminListUsers());
    }
}
