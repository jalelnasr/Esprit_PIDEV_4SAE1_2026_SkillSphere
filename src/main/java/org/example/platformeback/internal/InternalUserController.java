package org.example.platformeback.internal;

import lombok.RequiredArgsConstructor;
import org.example.platformeback.internal.dto.InternalUserContactResponse;
import org.example.platformeback.user.model.User;
import org.example.platformeback.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserRepository userRepository;

    @GetMapping("/{id}/exists")
    public boolean exists(@PathVariable Long id) {
        return userRepository.existsById(id);
    }

    @GetMapping("/{id}/contact")
    public InternalUserContactResponse contact(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return new InternalUserContactResponse(
                user.getIdUser(),
                user.getEmail(),
                user.getPrenom(),
                user.getNom(),
                user.getRole() != null ? user.getRole().name() : null
        );
    }
}