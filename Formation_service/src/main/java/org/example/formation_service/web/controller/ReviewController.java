package org.example.formation_service.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.CourseReview;
import org.example.formation_service.service.ReviewService;
import org.example.formation_service.web.dto.CourseRatingStats;
import org.example.formation_service.web.dto.ReviewRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses/{courseId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Avis", description = "Système de notation et commentaires — réservé aux apprenants inscrits")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @Operation(summary = "Ajouter ou modifier un avis",
        description = "1 avis par utilisateur par formation. Vérifie l'inscription et modère le contenu.")
    @PostMapping
    public ResponseEntity<CourseReview> addReview(
            @PathVariable Long courseId,
            @Valid @RequestBody ReviewRequest request) {
        CourseReview review = reviewService.addOrUpdateReview(courseId, request);
        return ResponseEntity.ok(review);
    }
    
    @Operation(summary = "Statistiques de notation", description = "Moyenne et nombre total d'avis pour une formation")
    @GetMapping("/stats")
    public ResponseEntity<CourseRatingStats> getRatingStats(@PathVariable Long courseId) {
        CourseRatingStats stats = reviewService.getCourseRatingStats(courseId);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/my-review")
    public ResponseEntity<CourseReview> getMyReview(
            @PathVariable Long courseId,
            @RequestParam Long userId) {
        CourseReview review = reviewService.getUserReview(courseId, userId);
        if (review == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(review);
    }
    
    @GetMapping
    public ResponseEntity<java.util.List<CourseReview>> getAllReviews(@PathVariable Long courseId) {
        java.util.List<CourseReview> reviews = reviewService.getAllReviews(courseId);
        return ResponseEntity.ok(reviews);
    }
}
