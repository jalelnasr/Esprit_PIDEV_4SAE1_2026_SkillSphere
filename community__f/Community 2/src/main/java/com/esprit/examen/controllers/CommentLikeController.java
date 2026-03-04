package com.esprit.examen.controllers;

import com.esprit.examen.entities.CommentLike;
import com.esprit.examen.services.CommentLikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comment-likes")
@Tag(name = "Comment Like", description = "Comment like management APIs")
public class CommentLikeController {

    @Autowired
    private CommentLikeService commentLikeService;

    @PostMapping("/{userId}/{commentId}")
    @Operation(summary = "Like a comment")
    public ResponseEntity<CommentLike> likeComment(@PathVariable Long userId, @PathVariable Long commentId) {
        return ResponseEntity.ok(commentLikeService.likeComment(userId, commentId));
    }

    @DeleteMapping("/{userId}/{commentId}")
    @Operation(summary = "Unlike a comment")
    public ResponseEntity<Void> unlikeComment(@PathVariable Long userId, @PathVariable Long commentId) {
        commentLikeService.unlikeComment(userId, commentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/comment/{commentId}")
    @Operation(summary = "Get likes by comment")
    public ResponseEntity<List<CommentLike>> getLikesByComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentLikeService.getLikesByComment(commentId));
    }
}