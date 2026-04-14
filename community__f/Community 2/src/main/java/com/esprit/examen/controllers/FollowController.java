package com.esprit.examen.controllers;

import com.esprit.examen.entities.Follow;
import com.esprit.examen.services.FollowService;
import com.esprit.examen.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/follows")
@Tag(name = "Follow", description = "Follow management APIs")
public class FollowController {

    @Autowired
    private FollowService followService;

    @Autowired
    private UserService userService;

    @PostMapping("/{followerId}/{followingId}")
    @Operation(summary = "Follow a user (legacy path with follower id)")
    public ResponseEntity<Follow> followUser(@PathVariable Long followerId, @PathVariable Long followingId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(followerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot follow on behalf of another user");
        }

        return ResponseEntity.ok(followService.followUser(currentUserId, followingId));
    }

    @DeleteMapping("/{followerId}/{followingId}")
    @Operation(summary = "Unfollow a user (legacy path with follower id)")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long followerId, @PathVariable Long followingId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(followerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot unfollow on behalf of another user");
        }

        followService.unfollowUser(currentUserId, followingId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/followers/{userId}")
    @Operation(summary = "Get followers of a user")
    public ResponseEntity<List<Follow>> getFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    @GetMapping("/following/{userId}")
    @Operation(summary = "Get users that a user follows")
    public ResponseEntity<List<Follow>> getFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }

    @GetMapping("/followers/{userId}/count")
    @Operation(summary = "Count followers of a user")
    public ResponseEntity<Long> countFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.countFollowers(userId));
    }

    @GetMapping("/following/{userId}/count")
    @Operation(summary = "Count users that a user follows")
    public ResponseEntity<Long> countFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.countFollowing(userId));
    }
}
