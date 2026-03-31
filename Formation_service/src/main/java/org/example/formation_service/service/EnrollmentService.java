package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.client.UserServiceValidator;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.domain.entity.Lesson;
import org.example.formation_service.domain.entity.LessonProgress;
import org.example.formation_service.domain.enums.CourseStatus;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.LessonProgressRepository;
import org.example.formation_service.repository.LessonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CourseService courseService;
    private final UserServiceValidator userServiceValidator;
    private final AccessControlService accessControlService;
    
    @Transactional
    public Enrollment enroll(Long userId, Long courseId) {
        // NEW: Check access control FIRST
        accessControlService.checkCanEnroll(userId, courseId);
        
        // Vérifier que l'utilisateur existe
        userServiceValidator.validateUserExists(userId);
        
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
