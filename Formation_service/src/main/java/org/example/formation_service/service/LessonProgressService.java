package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.domain.entity.Lesson;
import org.example.formation_service.domain.entity.LessonProgress;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.LessonProgressRepository;
import org.example.formation_service.repository.LessonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;

    /**
     * Mark a lesson as completed (automatically when student opens it)
     */
    @Transactional
    public LessonProgress markLessonCompleted(Long enrollmentId, Long lessonId) {
        log.info("Marking lesson {} as completed for enrollment {}", lessonId, enrollmentId);

        // Find or create lesson progress
        LessonProgress progress = lessonProgressRepository
            .findByEnrollmentIdAndLessonId(enrollmentId, lessonId)
            .orElseGet(() -> createNewProgress(enrollmentId, lessonId));

        // Mark as completed if not already
        if (!progress.getCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            progress.setLastAccessedAt(LocalDateTime.now());
            
            log.info("Lesson {} marked as completed for enrollment {}", lessonId, enrollmentId);
        } else {
            // Just update last accessed time
            progress.setLastAccessedAt(LocalDateTime.now());
            log.info("Lesson {} already completed, updated last accessed time", lessonId);
        }

        return lessonProgressRepository.save(progress);
    }

    /**
     * Track lesson access (update last accessed time)
     */
    @Transactional
    public LessonProgress trackLessonAccess(Long enrollmentId, Long lessonId) {
        log.info("Tracking access to lesson {} for enrollment {}", lessonId, enrollmentId);

        LessonProgress progress = lessonProgressRepository
            .findByEnrollmentIdAndLessonId(enrollmentId, lessonId)
            .orElseGet(() -> createNewProgress(enrollmentId, lessonId));

        progress.setLastAccessedAt(LocalDateTime.now());
        
        return lessonProgressRepository.save(progress);
    }

    private LessonProgress createNewProgress(Long enrollmentId, Long lessonId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found: " + enrollmentId));
        
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));

        LessonProgress progress = new LessonProgress();
        progress.setEnrollment(enrollment);
        progress.setLesson(lesson);
        progress.setCompleted(false);
        progress.setTimeSpentMinutes(0);
        progress.setLastAccessedAt(LocalDateTime.now());

        log.info("Created new lesson progress for enrollment {} and lesson {}", enrollmentId, lessonId);
        
        return progress;
    }
}
