package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.domain.entity.Lesson;
import org.example.formation_service.domain.entity.LessonProgress;
import org.example.formation_service.domain.enums.CourseStatus;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.feign.UserServiceClient;
import org.example.formation_service.feign.exception.UserNotFoundException;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.LessonProgressRepository;
import org.example.formation_service.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {
    
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CourseService courseService;
    private final UserServiceClient userServiceClient;
    private final AccessControlService accessControlService;

    @Value("${service.api.key}")
    private String serviceApiKey;
    
    @Transactional
    public Enrollment enroll(Long userId, Long courseId) {
        // NEW: Check access control FIRST
        accessControlService.checkCanEnroll(userId, courseId);
        
        // Vérifier que l'utilisateur existe via Feign (User Service)
        try {
            Boolean exists = userServiceClient.userExists(userId, serviceApiKey);
            if (Boolean.FALSE.equals(exists)) {
                throw new BusinessException("USER_NOT_FOUND", "Utilisateur introuvable");
            }
        } catch (UserNotFoundException e) {
            throw new BusinessException("USER_NOT_FOUND", "Utilisateur introuvable");
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("⚠️ Could not verify user {} via User Service: {}", userId, e.getMessage());
            // Fail-open: continue enrollment if User Service is unreachable
        }
        
        // Vérifier que le cours existe
        Course course = courseService.getCourseById(courseId);
        
        // Vérifier que le cours est publié
        if (course.getStatus() == CourseStatus.DRAFT) {
            throw new BusinessException("COURSE_NOT_PUBLISHED", "Cannot enroll in a draft course");
        }
        
        // Vérifier qu'il n'y a pas déjà une inscription
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new BusinessException("ALREADY_ENROLLED", "User is already enrolled in this course");
        }
        
        // Créer l'inscription
        Enrollment enrollment = Enrollment.builder()
            .userId(userId)
            .course(course)
            .status(EnrollmentStatus.ACTIVE)
            .completionPercent(0)
            .build();
        
        enrollment = enrollmentRepository.save(enrollment);
        
        // Créer les progress pour chaque lesson
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        for (Lesson lesson : lessons) {
            LessonProgress progress = LessonProgress.builder()
                .enrollment(enrollment)
                .lesson(lesson)
                .completed(false)
                .build();
            lessonProgressRepository.save(progress);
        }
        
        return enrollment;
    }
    
    @Transactional
    public Enrollment cancelEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new BusinessException("ENROLLMENT_NOT_FOUND", "Enrollment not found"));
        
        if (enrollment.getStatus() == EnrollmentStatus.CANCELED) {
            throw new BusinessException("ALREADY_CANCELED", "Enrollment is already canceled");
        }
        
        enrollment.setStatus(EnrollmentStatus.CANCELED);
        return enrollmentRepository.save(enrollment);
    }
    
    public List<Enrollment> getUserEnrollments(Long userId) {
        return enrollmentRepository.findByUserId(userId);
    }
    
    @Transactional
    public void recalculateProgress(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new BusinessException("ENROLLMENT_NOT_FOUND", "Enrollment not found"));
        
        long totalLessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(enrollment.getCourse().getId()).size();
        if (totalLessons == 0) {
            enrollment.setCompletionPercent(0);
            enrollmentRepository.save(enrollment);
            return;
        }
        
        long completedLessons = lessonProgressRepository.countByEnrollmentIdAndCompletedTrue(enrollmentId);
        int percent = (int) ((completedLessons * 100) / totalLessons);
        
        enrollment.setCompletionPercent(percent);
        
        if (percent == 100) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(java.time.LocalDateTime.now());
        }
        
        enrollmentRepository.save(enrollment);
    }
    
    // Check if user is enrolled in a course
    public boolean isUserEnrolledInCourse(Long userId, Long courseId) {
        return enrollmentRepository.existsByUserIdAndCourseIdAndStatus(
            userId, courseId, EnrollmentStatus.ACTIVE
        );
    }
}
