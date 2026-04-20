package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.LessonProgress;
import org.example.formation_service.service.LessonProgressService;
import org.example.formation_service.web.dto.LessonProgressResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lesson-progress")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

    /**
     * Mark a lesson as completed (called automatically when student opens lesson)
     * POST /api/lesson-progress/complete?enrollmentId=1&lessonId=5
     */
    @PostMapping("/complete")
    public ResponseEntity<LessonProgressResponse> markLessonCompleted(
            @RequestParam Long enrollmentId,
            @RequestParam Long lessonId) {
        
        log.info("API: Marking lesson {} as completed for enrollment {}", lessonId, enrollmentId);
        
        LessonProgress progress = lessonProgressService.markLessonCompleted(enrollmentId, lessonId);
        
        LessonProgressResponse response = LessonProgressResponse.builder()
                .id(progress.getId())
                .enrollmentId(progress.getEnrollment().getId())
                .lessonId(progress.getLesson().getId())
                .completed(progress.getCompleted())
                .completedAt(progress.getCompletedAt())
                .timeSpentMinutes(progress.getTimeSpentMinutes())
                .lastAccessedAt(progress.getLastAccessedAt())
                .build();
        
        return ResponseEntity.ok(response);
    }

    /**
     * Track lesson access (update last accessed time)
     * POST /api/lesson-progress/access?enrollmentId=1&lessonId=5
     */
    @PostMapping("/access")
    public ResponseEntity<LessonProgressResponse> trackLessonAccess(
            @RequestParam Long enrollmentId,
            @RequestParam Long lessonId) {
        
        log.info("API: Tracking access to lesson {} for enrollment {}", lessonId, enrollmentId);
        
        LessonProgress progress = lessonProgressService.trackLessonAccess(enrollmentId, lessonId);
        
        LessonProgressResponse response = LessonProgressResponse.builder()
                .id(progress.getId())
                .enrollmentId(progress.getEnrollment().getId())
                .lessonId(progress.getLesson().getId())
                .completed(progress.getCompleted())
                .completedAt(progress.getCompletedAt())
                .timeSpentMinutes(progress.getTimeSpentMinutes())
                .lastAccessedAt(progress.getLastAccessedAt())
                .build();
        
        return ResponseEntity.ok(response);
    }
}
