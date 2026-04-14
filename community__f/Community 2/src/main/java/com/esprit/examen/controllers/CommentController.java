package com.esprit.examen.controllers;

import com.esprit.examen.entities.Comment;
import com.esprit.examen.services.CommentService;
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
@RequestMapping("/api/comments")
@Tag(name = "Comment", description = "Comment management APIs")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserService userService;

    @PostMapping("/{postId}")
    @Operation(summary = "Create a new comment with authenticated user")
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment, @PathVariable Long postId) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(commentService.createComment(comment, currentUserId, postId));
    }

    @PostMapping("/{userId}/{postId}")
    @Operation(summary = "Create a new comment (legacy path with user id)")
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment, @PathVariable Long userId, @PathVariable Long postId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot create comment for another user");
        }

        return ResponseEntity.ok(commentService.createComment(comment, currentUserId, postId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get comment by ID")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentById(id));
    }

    @GetMapping("/post/{postId}")
    @Operation(summary = "Get comments by post")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get comments by user")
    public ResponseEntity<List<Comment>> getCommentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(commentService.getCommentsByUser(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update comment by ID")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @RequestBody Comment comment) {
        return ResponseEntity.ok(commentService.updateComment(id, comment));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete comment by ID")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }
}
