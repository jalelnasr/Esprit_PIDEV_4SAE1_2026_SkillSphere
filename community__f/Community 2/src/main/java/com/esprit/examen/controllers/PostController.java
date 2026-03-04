package com.esprit.examen.controllers;

import com.esprit.examen.entities.Post;
import com.esprit.examen.services.PostService;
import com.esprit.examen.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Post", description = "Post management APIs")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @PostMapping
    @Operation(summary = "Create a new post (automatically uses current user)")
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(postService.createPost(post, currentUserId));
    }

    @PostMapping("/group/{groupId}")
    @Operation(summary = "Create a new post in a specific group")
    public ResponseEntity<Post> createPostInGroup(@RequestBody Post post, @PathVariable Long groupId) {
        Long currentUserId = userService.getCurrentUserId();
        post.setGroupId(groupId);
        return ResponseEntity.ok(postService.createPost(post, currentUserId));
    }

    @GetMapping
    @Operation(summary = "Get all posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get post by ID")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get posts by user")
    public ResponseEntity<List<Post>> getPostsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(postService.getPostsByUser(userId));
    }

    @GetMapping("/group/{groupId}")
    @Operation(summary = "Get posts by group")
    public ResponseEntity<List<Post>> getPostsByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(postService.getPostsByGroup(groupId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update post by ID")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post post) {
        return ResponseEntity.ok(postService.updatePost(id, post));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete post by ID")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok().build();
    }
}