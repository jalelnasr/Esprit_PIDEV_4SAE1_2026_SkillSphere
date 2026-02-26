package com.esprit.examen.controllers;

import com.esprit.examen.dto.SubmitFlagRequest;
import com.esprit.examen.entities.UserProgress;
import com.esprit.examen.services.GamificationService;
import com.esprit.examen.services.UserProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@Tag(name = "User Progress", description = "User progress tracking APIs")
public class UserProgressController {

    @Autowired
    private UserProgressService userProgressService;

    @Autowired
    private GamificationService gamificationService;

    @PostMapping("/{userId}/{stepId}")
    @Operation(summary = "Create progress for a user on a lab step")
    public ResponseEntity<UserProgress> createProgress(@RequestBody UserProgress progress, @PathVariable Long userId, @PathVariable Long stepId) {
        return ResponseEntity.ok(userProgressService.createProgress(progress, userId, stepId));
    }

    @PostMapping("/submit-flag/{userId}/{stepId}")
    @Operation(summary = "Submit a flag for a lab step - validates flag, awards points, levels up, and grants badges")
    public ResponseEntity<UserProgress> submitFlag(
            @PathVariable Long userId,
            @PathVariable Long stepId,
            @Valid @RequestBody SubmitFlagRequest req) {
        return ResponseEntity.ok(gamificationService.submitFlag(userId, stepId, req.submittedFlag()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get progress by ID")
    public ResponseEntity<UserProgress> getProgressById(@PathVariable Long id) {
        return ResponseEntity.ok(userProgressService.getProgressById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all progress for a user")
    public ResponseEntity<List<UserProgress>> getProgressByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userProgressService.getProgressByUser(userId));
    }

    @GetMapping("/user/{userId}/lab/{labId}")
    @Operation(summary = "Get progress for a user on a specific lab")
    public ResponseEntity<List<UserProgress>> getProgressByUserAndLab(@PathVariable Long userId, @PathVariable Long labId) {
        return ResponseEntity.ok(userProgressService.getProgressByUserAndLab(userId, labId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update progress by ID")
    public ResponseEntity<UserProgress> updateProgress(@PathVariable Long id, @RequestBody UserProgress progress) {
        return ResponseEntity.ok(userProgressService.updateProgress(id, progress));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete progress by ID")
    public ResponseEntity<Void> deleteProgress(@PathVariable Long id) {
        userProgressService.deleteProgress(id);
        return ResponseEntity.ok().build();
    }
}
