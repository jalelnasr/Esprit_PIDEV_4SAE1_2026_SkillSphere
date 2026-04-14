package org.example.formation_service.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.service.EnrollmentService;
import org.example.formation_service.web.dto.EnrollmentRequest;
import org.example.formation_service.web.dto.EnrollmentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Inscriptions", description = "Inscription aux formations avec contrôle d'accès par abonnement")
public class EnrollmentController {
    
    private final EnrollmentService enrollmentService;
    
    @Operation(summary = "S'inscrire à une formation",
        description = "Vérifie l'abonnement actif, le niveau d'accès et la limite mensuelle avant inscription")
    @PostMapping("/courses/{id}/enroll")
    public ResponseEntity<EnrollmentResponse> enroll(@PathVariable Long id, @Valid @RequestBody EnrollmentRequest request) {
        Enrollment enrollment = enrollmentService.enroll(request.getUserId(), id);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(enrollment));
    }
    
    @PostMapping("/enrollments/{id}/cancel")
    public ResponseEntity<EnrollmentResponse> cancelEnrollment(@PathVariable Long id) {
        Enrollment enrollment = enrollmentService.cancelEnrollment(id);
        return ResponseEntity.ok(toResponse(enrollment));
    }
    
    @Operation(summary = "Mes inscriptions", description = "Retourne toutes les inscriptions d'un apprenant")
    @GetMapping("/users/{userId}/enrollments")
    public ResponseEntity<List<EnrollmentResponse>> getUserEnrollments(@PathVariable Long userId) {
        List<Enrollment> enrollments = enrollmentService.getUserEnrollments(userId);
        List<EnrollmentResponse> responses = enrollments.stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    private EnrollmentResponse toResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
            .id(enrollment.getId())
            .userId(enrollment.getUserId())
            .courseId(enrollment.getCourse().getId())
            .courseTitle(enrollment.getCourse().getTitle())
            .inscriptionDate(enrollment.getInscriptionDate())
            .status(enrollment.getStatus())
            .completionPercent(enrollment.getCompletionPercent())
            .completedAt(enrollment.getCompletedAt())
            .build();
    }
    
    // Check if user is enrolled in a course
    @GetMapping("/users/{userId}/courses/{courseId}/enrollment-status")
    public ResponseEntity<java.util.Map<String, Boolean>> checkCourseEnrollment(
        @PathVariable Long userId,
        @PathVariable Long courseId
    ) {
        boolean isEnrolled = enrollmentService.isUserEnrolledInCourse(userId, courseId);
        return ResponseEntity.ok(java.util.Map.of("isEnrolled", isEnrolled));
    }
}
