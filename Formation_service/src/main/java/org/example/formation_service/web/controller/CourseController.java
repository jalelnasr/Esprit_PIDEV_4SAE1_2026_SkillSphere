package org.example.formation_service.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.enums.CourseStatus;
import org.example.formation_service.service.CourseService;
import org.example.formation_service.web.dto.CourseRequest;
import org.example.formation_service.web.dto.CourseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Formations", description = "CRUD des formations, publication et gestion du contenu")
public class CourseController {
    
    private final CourseService courseService;
    
    @Operation(summary = "Créer une formation", description = "Accessible aux formateurs et admins")
    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request) {
        log.info("Creating course - title: {}, level: {}, createdBy: {}", 
            request.getTitle(), request.getLevel(), request.getCreatedBy());
        
        try {
            Course course = courseService.createCourse(request);
            log.info("Course created successfully with ID: {}", course.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(course));
        } catch (Exception e) {
            log.error("Error creating course", e);
            throw e;
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        Course course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(toResponse(course));
    }
    
    @Operation(summary = "Publier une formation", description = "Change le statut de DRAFT à PUBLISHED")
    @PostMapping("/{id}/publish")
    public ResponseEntity<CourseResponse> publishCourse(@PathVariable Long id) {
        Course course = courseService.publishCourse(id);
        return ResponseEntity.ok(toResponse(course));
    }
    
    @PostMapping("/{id}/unpublish")
    public ResponseEntity<CourseResponse> unpublishCourse(@PathVariable Long id) {
        Course course = courseService.unpublishCourse(id);
        return ResponseEntity.ok(toResponse(course));
    }
    
    @Operation(summary = "Lister toutes les formations", description = "Filtrable par statut (DRAFT, PUBLISHED, ARCHIVED)")
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getCourses(@RequestParam(required = false) CourseStatus status) {
        List<Course> courses = courseService.getCoursesByStatus(status);
        List<CourseResponse> responses = courses.stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        return ResponseEntity.ok(toResponse(course));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        log.info("Deleting course with ID: {}", id);
        courseService.deleteCourse(id);
        log.info("Course deleted successfully with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
    
    private CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
            .id(course.getId())
            .title(course.getTitle())
            .description(course.getDescription())
            .level(course.getLevel())
            .accessLevel(course.getAccessLevel())
            .language(course.getLanguage())
            .durationMinutes(course.getDurationMinutes())
            .thumbnailUrl(course.getThumbnailUrl())
            .status(course.getStatus())
            .createdAt(course.getCreatedAt())
            .createdBy(course.getCreatedBy())
            .build();
    }
}
