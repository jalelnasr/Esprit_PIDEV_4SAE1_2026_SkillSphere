package org.example.formation_service.web.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.LearningPath;
import org.example.formation_service.domain.entity.LearningPathItem;
import org.example.formation_service.service.LearningPathService;
import org.example.formation_service.web.dto.CourseResponse;
import org.example.formation_service.web.dto.LearningPathItemRequest;
import org.example.formation_service.web.dto.LearningPathRequest;
import org.example.formation_service.web.dto.LearningPathRoadmapResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/learning-paths")
@RequiredArgsConstructor
public class LearningPathController {
    
    private final LearningPathService learningPathService;
    
    @PostMapping
    public ResponseEntity<LearningPath> createLearningPath(@Valid @RequestBody LearningPathRequest request) {
        LearningPath learningPath = learningPathService.createLearningPath(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(learningPath);
    }
    
    @PostMapping("/{id}/items")
    public ResponseEntity<LearningPathItem> addItem(@PathVariable Long id, @Valid @RequestBody LearningPathItemRequest request) {
        LearningPathItem item = learningPathService.addItem(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }
    
    @GetMapping("/{id}/roadmap")
    public ResponseEntity<LearningPathRoadmapResponse> getRoadmap(@PathVariable Long id, @RequestParam Long userId) {
        LearningPathRoadmapResponse roadmap = learningPathService.getRoadmap(id, userId);
        return ResponseEntity.ok(roadmap);
    }
    
    @GetMapping("/{id}/next")
    public ResponseEntity<CourseResponse> getNextCourse(@PathVariable Long id, @RequestParam Long userId) {
        Course course = learningPathService.getNextCourse(id, userId);
        return ResponseEntity.ok(toCourseResponse(course));
    }
    
    private CourseResponse toCourseResponse(Course course) {
        return CourseResponse.builder()
            .id(course.getId())
            .title(course.getTitle())
            .description(course.getDescription())
            .level(course.getLevel())
            .language(course.getLanguage())
            .durationMinutes(course.getDurationMinutes())
            .thumbnailUrl(course.getThumbnailUrl())
            .status(course.getStatus())
            .createdAt(course.getCreatedAt())
            .createdBy(course.getCreatedBy())
            .build();
    }
}
