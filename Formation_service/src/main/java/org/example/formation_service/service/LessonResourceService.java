package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.Lesson;
import org.example.formation_service.domain.entity.LessonResource;
import org.example.formation_service.domain.enums.ResourceType;
import org.example.formation_service.repository.LessonRepository;
import org.example.formation_service.repository.LessonResourceRepository;
import org.example.formation_service.web.dto.LessonResourceRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonResourceService {
    
    private final LessonResourceRepository lessonResourceRepository;
    private final LessonRepository lessonRepository;
    private final AccessControlService accessControlService;
    
    /**
     * Add a video resource to a lesson
     */
    @Transactional
    public LessonResource addVideoResource(Long lessonId, LessonResourceRequest request, Long userId, String userRole) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        // Check if user can modify this formation
        if (!accessControlService.canModifyFormation(lesson.getCourse().getId(), userId, userRole)) {
            throw new RuntimeException("You do not have permission to modify this formation");
        }
        
        // Validate URL format
        if (request.getUrl() == null || request.getUrl().trim().isEmpty()) {
            throw new RuntimeException("Video URL is required");
        }
        
        LessonResource resource = LessonResource.builder()
            .title(request.getTitle())
            .type(ResourceType.VIDEO)
            .url(request.getUrl())
            .durationMinutes(request.getDurationMinutes())
            .lesson(lesson)
            .build();
        
        return lessonResourceRepository.save(resource);
    }
    
    /**
     * Add a PDF resource to a lesson
     * Note: For now, this accepts a URL. File upload functionality can be added later.
     */
    @Transactional
    public LessonResource addPdfResource(Long lessonId, LessonResourceRequest request, Long userId, String userRole) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        // Check if user can modify this formation
        if (!accessControlService.canModifyFormation(lesson.getCourse().getId(), userId, userRole)) {
            throw new RuntimeException("You do not have permission to modify this formation");
        }
        
        // Validate URL
        if (request.getUrl() == null || request.getUrl().trim().isEmpty()) {
            throw new RuntimeException("PDF URL is required");
        }
        
        LessonResource resource = LessonResource.builder()
            .title(request.getTitle())
            .type(ResourceType.PDF)
            .url(request.getUrl())
            .fileSizeBytes(request.getFileSizeBytes())
            .lesson(lesson)
            .build();
        
        return lessonResourceRepository.save(resource);
    }
    
    /**
     * Update a resource
     */
    @Transactional
    public LessonResource updateResource(Long resourceId, LessonResourceRequest request, Long userId, String userRole) {
        LessonResource resource = lessonResourceRepository.findById(resourceId)
            .orElseThrow(() -> new RuntimeException("Resource not found"));
        
        // Check if user can modify this formation
        if (!accessControlService.canModifyFormation(resource.getLesson().getCourse().getId(), userId, userRole)) {
            throw new RuntimeException("You do not have permission to modify this formation");
        }
        
        resource.setTitle(request.getTitle());
        resource.setUrl(request.getUrl());
        resource.setDurationMinutes(request.getDurationMinutes());
        resource.setFileSizeBytes(request.getFileSizeBytes());
        
        return lessonResourceRepository.save(resource);
    }
    
    /**
     * Delete a resource
     */
    @Transactional
    public void deleteResource(Long resourceId, Long userId, String userRole) {
        LessonResource resource = lessonResourceRepository.findById(resourceId)
            .orElseThrow(() -> new RuntimeException("Resource not found"));
        
        // Check if user can modify this formation
        if (!accessControlService.canModifyFormation(resource.getLesson().getCourse().getId(), userId, userRole)) {
            throw new RuntimeException("You do not have permission to modify this formation");
        }
        
        lessonResourceRepository.delete(resource);
    }
    
    /**
     * Get all resources for a lesson
     */
    public List<LessonResource> getResourcesByLessonId(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        return lesson.getResources();
    }
}
