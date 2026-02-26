package com.esprit.examen.controllers;

import com.esprit.examen.dto.CreateReviewRequest;
import com.esprit.examen.dto.LabRatingSummary;
import com.esprit.examen.dto.LabReviewResponse;
import com.esprit.examen.services.LabReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Lab Reviews", description = "Lab rating and review APIs")
public class LabReviewController {

    private final LabReviewService labReviewService;

    @PostMapping("/{userId}/{labId}")
    @Operation(summary = "Submit a review for a lab (1-5 stars + optional comment). One review per user per lab.")
    public ResponseEntity<LabReviewResponse> createReview(
            @PathVariable Long userId,
            @PathVariable Long labId,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(labReviewService.createReview(userId, labId, request));
    }

    @GetMapping("/lab/{labId}")
    @Operation(summary = "Get all reviews for a specific lab (newest first)")
    public ResponseEntity<List<LabReviewResponse>> getReviewsByLab(@PathVariable Long labId) {
        return ResponseEntity.ok(labReviewService.getReviewsByLab(labId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all reviews written by a specific user")
    public ResponseEntity<List<LabReviewResponse>> getReviewsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(labReviewService.getReviewsByUser(userId));
    }

    @GetMapping("/lab/{labId}/summary")
    @Operation(summary = "Get average rating and total review count for a lab")
    public ResponseEntity<LabRatingSummary> getLabRatingSummary(@PathVariable Long labId) {
        return ResponseEntity.ok(labReviewService.getLabRatingSummary(labId));
    }

    @PutMapping("/{reviewId}")
    @Operation(summary = "Update an existing review (rating and/or comment)")
    public ResponseEntity<LabReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(labReviewService.updateReview(reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Delete a review by its ID")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        labReviewService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }
}
