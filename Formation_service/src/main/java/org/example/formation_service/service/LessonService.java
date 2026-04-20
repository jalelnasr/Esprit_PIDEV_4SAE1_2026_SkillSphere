package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.Lesson;
import org.example.formation_service.domain.entity.LessonResource;
import org.example.formation_service.repository.LessonRepository;
import org.example.formation_service.repository.LessonResourceRepository;
import org.example.formation_service.web.dto.LessonRequest;
import org.example.formation_service.web.dto.LessonResourceRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {
    
    private final LessonRepository lessonRepository;
    private final LessonResourceRepository lessonResourceRepository;
    private final CourseService courseService;
    private final AccessControlService accessControlService;
    
    /**
     * Create a new lesson (chapter) for a course
     */
    @Transactional
    public Lesson createLesson(Long courseId, LessonRequest request, Long userId, String userRole) {
        // Check if user can modify this formation
        if (!accessControlService.canModifyFormation(courseId, userId, userRole)) {
            throw new RuntimeException("You do not have permission to modify this formation");
        }
        
        Course course = courseService.getCourseById(courseId);
        
        Lesson lesson = Lesson.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .orderIndex(request.getOrderIndex())
            .durationMinutes(request.getDurationMinutes())
            .course(course)
            .build();
        
        return lessonRepository.save(lesson);
    }
    
    /**
     * Update an existing lesson
     */
    @Transactional
    public Lesson updateLesson(Long lessonId, LessonRequest request, Long userId, String userRole) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        // Check if user can modify this formation
        if (!accessControlService.canModifyFormation(lesson.getCourse().getId(), userId, userRole)) {
            throw new RuntimeException("You do not have permission to modify this formation");
        }
        
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setOrderIndex(request.getOrderIndex());
        lesson.setDurationMinutes(request.getDurationMinutes());
        
        return lessonRepository.save(lesson);
    }
    
    /**
     * Delete a lesson and all its resources
     */
    @Transactional
    public void deleteLesson(Long lessonId, Long userId, String userRole) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        // Check if user can modify this formation
        if (!accessControlService.canModifyFormation(lesson.getCourse().getId(), userId, userRole)) {
            throw new RuntimeException("You do not have permission to modify this formation");
        }
        
        lessonRepository.delete(lesson);
    }
    
    /**
     * Get all lessons for a course (ordered by position)
     */
    public List<Lesson> getLessonsByCourseId(Long courseId) {
        return lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
    }
    
    /**
     * Get a single lesson by ID
     */
    public Lesson getLessonById(Long lessonId) {
        return lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
    }
    
    /**
     * Reorder lessons within a course
     */
    @Transactional
    public void reorderLessons(Long courseId, List<Long> lessonIds, Long userId, String userRole) {
        // Check if user can modify this formation
        if (!accessControlService.canModifyFormation(courseId, userId, userRole)) {
            throw new RuntimeException("You do not have permission to modify this formation");
        }
        
        // Update positions
        for (int i = 0; i < lessonIds.size(); i++) {
            Long lessonId = lessonIds.get(i);
            Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));
            
            lesson.setOrderIndex(i);
            lessonRepository.save(lesson);
        }
    }
    
    /**
     * Add a resource to a lesson (legacy method - kept for backward compatibility)
     */
    @Transactional
    public LessonResource addResource(Long lessonId, LessonResourceRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        LessonResource resource = LessonResource.builder()
            .title(request.getTitle())
            .type(request.getType())
            .url(request.getUrl())
            .durationMinutes(request.getDurationMinutes())
            .lesson(lesson)
            .build();
        
        return lessonResourceRepository.save(resource);
    }
}
