package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.*;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.LearningPathItemRepository;
import org.example.formation_service.repository.LearningPathRepository;
import org.example.formation_service.web.dto.LearningPathItemRequest;
import org.example.formation_service.web.dto.LearningPathRequest;
import org.example.formation_service.web.dto.LearningPathRoadmapResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LearningPathService {
    
    private final LearningPathRepository learningPathRepository;
    private final LearningPathItemRepository learningPathItemRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseService courseService;
    
    @Transactional
    public LearningPath createLearningPath(LearningPathRequest request) {
        LearningPath learningPath = LearningPath.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .createdBy(request.getCreatedBy())
            .build();
        
        return learningPathRepository.save(learningPath);
    }
    
    @Transactional
    public LearningPathItem addItem(Long learningPathId, LearningPathItemRequest request) {
        LearningPath learningPath = learningPathRepository.findById(learningPathId)
            .orElseThrow(() -> new BusinessException("LEARNING_PATH_NOT_FOUND", "Learning path not found"));
        
        Course course = courseService.getCourseById(request.getCourseId());
        
        LearningPathItem item = LearningPathItem.builder()
            .learningPath(learningPath)
            .course(course)
            .orderIndex(request.getOrderIndex())
            .build();
        
        return learningPathItemRepository.save(item);
    }
    
    public LearningPathRoadmapResponse getRoadmap(Long learningPathId, Long userId) {
        LearningPath learningPath = learningPathRepository.findById(learningPathId)
            .orElseThrow(() -> new BusinessException("LEARNING_PATH_NOT_FOUND", "Learning path not found"));
        
        List<LearningPathRoadmapResponse.CourseRoadmapItem> roadmapItems = new ArrayList<>();
        
        boolean previousCompleted = true;
        for (LearningPathItem item : learningPath.getItems()) {
            Optional<Enrollment> enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, item.getCourse().getId());
            
            boolean isCompleted = enrollment.isPresent() && enrollment.get().getStatus() == EnrollmentStatus.COMPLETED;
            boolean isLocked = !previousCompleted;
            
            roadmapItems.add(LearningPathRoadmapResponse.CourseRoadmapItem.builder()
                .courseId(item.getCourse().getId())
                .courseTitle(item.getCourse().getTitle())
                .orderIndex(item.getOrderIndex())
                .isLocked(isLocked)
                .isCompleted(isCompleted)
                .build());
            
            previousCompleted = isCompleted;
        }
        
        return LearningPathRoadmapResponse.builder()
            .learningPathId(learningPath.getId())
            .title(learningPath.getTitle())
            .courses(roadmapItems)
            .build();
    }
    
    public Course getNextCourse(Long learningPathId, Long userId) {
        LearningPath learningPath = learningPathRepository.findById(learningPathId)
            .orElseThrow(() -> new BusinessException("LEARNING_PATH_NOT_FOUND", "Learning path not found"));
        
        for (LearningPathItem item : learningPath.getItems()) {
            Optional<Enrollment> enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, item.getCourse().getId());
            
            if (enrollment.isEmpty() || enrollment.get().getStatus() != EnrollmentStatus.COMPLETED) {
                return item.getCourse();
            }
        }
        
        throw new BusinessException("ALL_COMPLETED", "All courses in learning path are completed");
    }
}
