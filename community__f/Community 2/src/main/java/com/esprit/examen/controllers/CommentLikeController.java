package com.esprit.examen.controllers;

import com.esprit.examen.entities.CommentLike;
import com.esprit.examen.services.CommentLikeService;
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
@RequestMapping("/api/comment-likes")
@Tag(name = "Comment Like", description = "Comment like management APIs")
public class CommentLikeController {

    @Autowired
    private CommentLikeService commentLikeService;

    @Autowired
    private UserService userService;

    @PostMapping("/{commentId}")
    @Operation(summary = "Like a comment with authenticated user")
    public ResponseEntity<CommentLike> likeComment(@PathVariable Long commentId) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(commentLikeService.likeComment(currentUserId, commentId));
    }

    @PostMapping("/{userId}/{commentId}")
    @Operation(summary = "Like a comment (legacy path with user id)")
    public ResponseEntity<CommentLike> likeComment(@PathVariable Long userId, @PathVariable Long commentId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot like comment for another user");
        }

        return ResponseEntity.ok(commentLikeService.likeComment(currentUserId, commentId));
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Unlike a comment with authenticated user")
    public ResponseEntity<Void> unlikeComment(@PathVariable Long commentId) {
        Long currentUserId = userService.getCurrentUserId();
        commentLikeService.unlikeComment(currentUserId, commentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/{commentId}")
    @Operation(summary = "Unlike a comment (legacy path with user id)")
    public ResponseEntity<Void> unlikeComment(@PathVariable Long userId, @PathVariable Long commentId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot unlike comment for another user");
        }

        commentLikeService.unlikeComment(currentUserId, commentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/comment/{commentId}")
    @Operation(summary = "Get likes by comment")
    public ResponseEntity<List<CommentLike>> getLikesByComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentLikeService.getLikesByComment(commentId));
    }
}
