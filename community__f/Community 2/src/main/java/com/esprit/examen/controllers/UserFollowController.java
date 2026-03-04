package com.esprit.examen.controllers;

import com.esprit.examen.dto.FollowStatusResponseDTO;
import com.esprit.examen.services.FollowService;
import com.esprit.examen.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Follow", description = "Follow/unfollow APIs for authenticated user")
public class UserFollowController {

    private final FollowService followService;
    private final UserService userService;

    public UserFollowController(FollowService followService, UserService userService) {
        this.followService = followService;
        this.userService = userService;
    }

    @PostMapping("/{userId}/follow")
    @Operation(summary = "Follow a user with authenticated follower")
    public ResponseEntity<FollowStatusResponseDTO> followUser(@PathVariable Long userId) {
        Long currentUserId = userService.getCurrentUserId();
        followService.followUser(currentUserId, userId);
        return ResponseEntity.ok(new FollowStatusResponseDTO(true));
    }

    @DeleteMapping("/{userId}/unfollow")
    @Operation(summary = "Unfollow a user with authenticated follower")
    public ResponseEntity<FollowStatusResponseDTO> unfollowUser(@PathVariable Long userId) {
        Long currentUserId = userService.getCurrentUserId();
        followService.unfollowUser(currentUserId, userId);
        return ResponseEntity.ok(new FollowStatusResponseDTO(false));
    }

    @GetMapping("/{userId}/follow-status")
    @Operation(summary = "Check follow status for authenticated user")
    public ResponseEntity<FollowStatusResponseDTO> getFollowStatus(@PathVariable Long userId) {
        Long currentUserId = userService.getCurrentUserId();
        boolean isFollowing = followService.isFollowing(currentUserId, userId);
        return ResponseEntity.ok(new FollowStatusResponseDTO(isFollowing));
    }
}
