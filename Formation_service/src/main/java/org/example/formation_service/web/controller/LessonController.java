package org.example.formation_service.web.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.Lesson;
import org.example.formation_service.domain.entity.LessonResource;
import org.example.formation_service.service.LessonResourceService;
import org.example.formation_service.service.LessonService;
import org.example.formation_service.web.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/formation")
@RequiredArgsConstructor
public class LessonController {
    
    private final LessonService lessonService;
    private final LessonResourceService lessonResourceService;
    
    /**
     * Create a new lesson (chapter) for a course
     */
    @PostMapping("/courses/{courseId}/lessons")
    public ResponseEntity<LessonResponse> createLesson(
            @PathVariable Long courseId,
            @Valid @RequestBody LessonRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        Lesson lesson = lessonService.createLesson(courseId, request, userId, userRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(lesson));
    }
    
    /**
     * Get all lessons for a course
     */
    @GetMapping("/courses/{courseId}/lessons")
    public ResponseEntity<List<LessonResponse>> getCourseLessons(@PathVariable Long courseId) {
        List<Lesson> lessons = lessonService.getLessonsByCourseId(courseId);
        List<LessonResponse> responses = lessons.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Get a single lesson by ID
     */
    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonResponse> getLesson(@PathVariable Long lessonId) {
        Lesson lesson = lessonService.getLessonById(lessonId);
        return ResponseEntity.ok(toResponse(lesson));
    }
    
    /**
     * Update a lesson
     */
    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        Lesson lesson = lessonService.updateLesson(lessonId, request, userId, userRole);
        return ResponseEntity.ok(toResponse(lesson));
    }
    
    /**
     * Delete a lesson
     */
    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable Long lessonId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        lessonService.deleteLesson(lessonId, userId, userRole);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Reorder lessons within a course
     */
    @PutMapping("/courses/{courseId}/lessons/reorder")
    public ResponseEntity<Void> reorderLessons(
            @PathVariable Long courseId,
            @RequestBody List<Long> lessonIds,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        lessonService.reorderLessons(courseId, lessonIds, userId, userRole);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Add a video resource to a lesson
     */
    @PostMapping("/lessons/{lessonId}/resources/video")
    public ResponseEntity<LessonResourceResponse> addVideoResource(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonResourceRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        LessonResource resource = lessonResourceService.addVideoResource(lessonId, request, userId, userRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResourceResponse(resource));
    }
    
    /**
     * Add a PDF resource to a lesson
     */
    @PostMapping("/lessons/{lessonId}/resources/pdf")
    public ResponseEntity<LessonResourceResponse> addPdfResource(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonResourceRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        LessonResource resource = lessonResourceService.addPdfResource(lessonId, request, userId, userRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResourceResponse(resource));
    }
    
    /**
     * Get all resources for a lesson
     */
    @GetMapping("/lessons/{lessonId}/resources")
    public ResponseEntity<List<LessonResourceResponse>> getLessonResources(@PathVariable Long lessonId) {
        List<LessonResource> resources = lessonResourceService.getResourcesByLessonId(lessonId);
        List<LessonResourceResponse> responses = resources.stream()
            .map(this::toResourceResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Update a resource
     */
    @PutMapping("/resources/{resourceId}")
    public ResponseEntity<LessonResourceResponse> updateResource(
            @PathVariable Long resourceId,
            @Valid @RequestBody LessonResourceRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        LessonResource resource = lessonResourceService.updateResource(resourceId, request, userId, userRole);
        return ResponseEntity.ok(toResourceResponse(resource));
    }
    
    /**
     * Delete a resource
     */
    @DeleteMapping("/resources/{resourceId}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long resourceId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        lessonResourceService.deleteResource(resourceId, userId, userRole);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Legacy endpoint - kept for backward compatibility
     */
    @PostMapping("/lessons/{id}/resources")
    public ResponseEntity<LessonResourceResponse> addResource(
            @PathVariable Long id,
            @Valid @RequestBody LessonResourceRequest request) {
        
        LessonResource resource = lessonService.addResource(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResourceResponse(resource));
    }
    
    private LessonResponse toResponse(Lesson lesson) {
        List<LessonResourceResponse> resourceResponses = lesson.getResources().stream()
            .map(this::toResourceResponse)
            .collect(Collectors.toList());
        
        return LessonResponse.builder()
            .id(lesson.getId())
            .title(lesson.getTitle())
            .description(lesson.getDescription())
            .orderIndex(lesson.getOrderIndex())
            .durationMinutes(lesson.getDurationMinutes())
            .courseId(lesson.getCourse().getId())
            .resources(resourceResponses)
            .build();
    }
    
    private LessonResourceResponse toResourceResponse(LessonResource resource) {
        return LessonResourceResponse.builder()
            .id(resource.getId())
            .title(resource.getTitle())
            .type(resource.getType())
            .url(resource.getUrl())
            .durationMinutes(resource.getDurationMinutes())
            .fileSizeBytes(resource.getFileSizeBytes())
            .lessonId(resource.getLesson().getId())
            .build();
    }
}
