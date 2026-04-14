package com.esprit.examen.controllers;

import com.esprit.examen.entities.PostLike;
import com.esprit.examen.services.PostLikeService;
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
@RequestMapping("/api/post-likes")
@Tag(name = "Post Like", description = "Post like management APIs")
public class PostLikeController {

    @Autowired
    private PostLikeService postLikeService;

    @Autowired
    private UserService userService;

    @PostMapping("/{postId}")
    @Operation(summary = "Like a post")
    public ResponseEntity<PostLike> likePost(@PathVariable Long postId) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(postLikeService.likePost(currentUserId, postId));
    }

    @PostMapping("/{userId}/{postId}")
    @Operation(summary = "Like a post with explicit user id (legacy)")
    public ResponseEntity<PostLike> likePostByUser(@PathVariable Long userId, @PathVariable Long postId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot like posts for another user");
        }

        return ResponseEntity.ok(postLikeService.likePost(currentUserId, postId));
    }

    @DeleteMapping("/{postId}")
    @Operation(summary = "Unlike a post")
    public ResponseEntity<Void> unlikePost(@PathVariable Long postId) {
        Long currentUserId = userService.getCurrentUserId();
        postLikeService.unlikePost(currentUserId, postId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/{postId}")
    @Operation(summary = "Unlike a post with explicit user id (legacy)")
    public ResponseEntity<Void> unlikePostByUser(@PathVariable Long userId, @PathVariable Long postId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot unlike posts for another user");
        }

        postLikeService.unlikePost(currentUserId, postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/post/{postId}")
    @Operation(summary = "Get likes by post")
    public ResponseEntity<List<PostLike>> getLikesByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(postLikeService.getLikesByPost(postId));
    }

    @GetMapping("/post/{postId}/count")
    @Operation(summary = "Count likes by post")
    public ResponseEntity<Long> countLikesByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(postLikeService.countLikesByPost(postId));
    }
}
