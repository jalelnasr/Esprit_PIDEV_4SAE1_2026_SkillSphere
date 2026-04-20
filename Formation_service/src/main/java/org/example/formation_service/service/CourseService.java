package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.enums.CourseStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.CourseRepository;
import org.example.formation_service.web.dto.CourseRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {
    
    private final CourseRepository courseRepository;
    
    @Transactional
    public Course createCourse(CourseRequest request) {
        Course course = Course.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .level(request.getLevel())
            .language(request.getLanguage())
            .durationMinutes(request.getDurationMinutes())
            .thumbnailUrl(request.getThumbnailUrl())
            .createdBy(request.getCreatedBy())
            .status(CourseStatus.DRAFT)
            .build();
        
        return courseRepository.save(course);
    }
    
    @Transactional
    public Course updateCourse(Long id, CourseRequest request) {
        Course course = getCourseById(id);
        
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setLanguage(request.getLanguage());
        course.setDurationMinutes(request.getDurationMinutes());
        course.setThumbnailUrl(request.getThumbnailUrl());
        
        return courseRepository.save(course);
    }
    
    @Transactional
    public Course publishCourse(Long id) {
        Course course = getCourseById(id);
        
        if (course.getStatus() == CourseStatus.PUBLISHED) {
            return course; // Already published, return as is
        }
        
        course.setStatus(CourseStatus.PUBLISHED);
        return courseRepository.save(course);
    }
    
    @Transactional
    public Course unpublishCourse(Long id) {
        Course course = getCourseById(id);
        
        if (course.getStatus() == CourseStatus.DRAFT) {
            return course; // Already draft, return as is
        }
        
        course.setStatus(CourseStatus.DRAFT);
        return courseRepository.save(course);
    }
    
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
            .orElseThrow(() -> new BusinessException("COURSE_NOT_FOUND", "Course not found with ID: " + id));
    }
    
    public List<Course> getCoursesByStatus(CourseStatus status) {
        if (status == null) {
            return courseRepository.findAll();
        }
        return courseRepository.findByStatus(status);
    }
    
    @Transactional
    public void deleteCourse(Long id) {
        // Verify course exists
        if (!courseRepository.existsById(id)) {
            throw new BusinessException("COURSE_NOT_FOUND", "Course not found with ID: " + id);
        }
        
        // Delete related entities in correct order (most dependent first)
        courseRepository.deleteLearningPathItemsByCourseId(id);
        courseRepository.deleteEnrollmentsByCourseId(id);
        courseRepository.deleteSessionsByCourseId(id);
        courseRepository.deleteLessonsByCourseId(id);
        
        // Finally delete the course
        courseRepository.deleteById(id);
    }
}
