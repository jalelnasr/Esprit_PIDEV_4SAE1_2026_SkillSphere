package org.example.formation_service.service;

import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.domain.entity.Lesson;
import org.example.formation_service.domain.entity.LessonProgress;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.LessonProgressRepository;
import org.example.formation_service.repository.LessonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LessonProgressServiceTest {

    @Mock private LessonProgressRepository lessonProgressRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private LessonRepository lessonRepository;

    @InjectMocks private LessonProgressService lessonProgressService;

    private Enrollment enrollment;
    private Lesson lesson;
    private LessonProgress existingProgress;

    @BeforeEach
    void setUp() {
        Course course = new Course();
        course.setId(100L);

        enrollment = new Enrollment();
        enrollment.setId(1L);
        enrollment.setCourse(course);
        enrollment.setUserId(1L);

        lesson = new Lesson();
        lesson.setId(10L);
        lesson.setTitle("Introduction to Java");
        lesson.setCourse(course);

        existingProgress = new LessonProgress();
        existingProgress.setId(1L);
        existingProgress.setEnrollment(enrollment);
        existingProgress.setLesson(lesson);
        existingProgress.setCompleted(false);
        existingProgress.setTimeSpentMinutes(0);
        existingProgress.setLastAccessedAt(LocalDateTime.now().minusDays(1));
    }

    // ── markLessonCompleted ───────────────────────────────────────────────────

    @Test
    void markLessonCompleted_shouldThrow_whenEnrollmentNotFound() {
        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(999L, 10L))
            .thenReturn(Optional.empty());
        when(enrollmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonProgressService.markLessonCompleted(999L, 10L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Enrollment not found");
    }

    @Test
    void markLessonCompleted_shouldThrow_whenLessonNotFound() {
        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(1L, 999L))
            .thenReturn(Optional.empty());
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonProgressService.markLessonCompleted(1L, 999L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Lesson not found");
    }

    @Test
    void markLessonCompleted_shouldCreateNewProgress_whenNotExists() {
        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(1L, 10L))
            .thenReturn(Optional.empty());
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(lessonProgressRepository.save(any(LessonProgress.class))).thenAnswer(i -> {
            LessonProgress progress = i.getArgument(0);
            progress.setId(1L);
            return progress;
        });

        LessonProgress result = lessonProgressService.markLessonCompleted(1L, 10L);

        assertThat(result).isNotNull();
        assertThat(result.getCompleted()).isTrue();
        assertThat(result.getCompletedAt()).isNotNull();
        assertThat(result.getLastAccessedAt()).isNotNull();
        verify(lessonProgressRepository).save(any(LessonProgress.class));
    }

    @Test
    void markLessonCompleted_shouldMarkAsCompleted_whenExistsButNotCompleted() {
        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(1L, 10L))
            .thenReturn(Optional.of(existingProgress));
        when(lessonProgressRepository.save(any(LessonProgress.class))).thenAnswer(i -> i.getArgument(0));

        LessonProgress result = lessonProgressService.markLessonCompleted(1L, 10L);

        assertThat(result.getCompleted()).isTrue();
        assertThat(result.getCompletedAt()).isNotNull();
        assertThat(result.getLastAccessedAt()).isAfterOrEqualTo(existingProgress.getLastAccessedAt());
        verify(lessonProgressRepository).save(existingProgress);
    }

    @Test
    void markLessonCompleted_shouldUpdateLastAccessed_whenAlreadyCompleted() {
        existingProgress.setCompleted(true);
        existingProgress.setCompletedAt(LocalDateTime.now().minusDays(2));
        LocalDateTime oldLastAccessed = existingProgress.getLastAccessedAt();

        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(1L, 10L))
            .thenReturn(Optional.of(existingProgress));
        when(lessonProgressRepository.save(any(LessonProgress.class))).thenAnswer(i -> i.getArgument(0));

        LessonProgress result = lessonProgressService.markLessonCompleted(1L, 10L);

        assertThat(result.getCompleted()).isTrue();
        assertThat(result.getCompletedAt()).isNotNull(); // Keeps original completion date
        assertThat(result.getLastAccessedAt()).isAfter(oldLastAccessed); // Updates last accessed
        verify(lessonProgressRepository).save(existingProgress);
    }

    // ── trackLessonAccess ─────────────────────────────────────────────────────

    @Test
    void trackLessonAccess_shouldCreateNewProgress_whenNotExists() {
        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(1L, 10L))
            .thenReturn(Optional.empty());
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(lessonProgressRepository.save(any(LessonProgress.class))).thenAnswer(i -> {
            LessonProgress progress = i.getArgument(0);
            progress.setId(1L);
            return progress;
        });

        LessonProgress result = lessonProgressService.trackLessonAccess(1L, 10L);

        assertThat(result).isNotNull();
        assertThat(result.getCompleted()).isFalse(); // Not marked as completed
        assertThat(result.getLastAccessedAt()).isNotNull();
        assertThat(result.getTimeSpentMinutes()).isEqualTo(0);
        verify(lessonProgressRepository).save(any(LessonProgress.class));
    }

    @Test
    void trackLessonAccess_shouldUpdateLastAccessed_whenExists() {
        LocalDateTime oldLastAccessed = existingProgress.getLastAccessedAt();

        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(1L, 10L))
            .thenReturn(Optional.of(existingProgress));
        when(lessonProgressRepository.save(any(LessonProgress.class))).thenAnswer(i -> i.getArgument(0));

        LessonProgress result = lessonProgressService.trackLessonAccess(1L, 10L);

        assertThat(result.getLastAccessedAt()).isAfter(oldLastAccessed);
        assertThat(result.getCompleted()).isFalse(); // Doesn't change completion status
        verify(lessonProgressRepository).save(existingProgress);
    }

    @Test
    void trackLessonAccess_shouldNotChangeCompletion_whenAlreadyCompleted() {
        existingProgress.setCompleted(true);
        existingProgress.setCompletedAt(LocalDateTime.now().minusDays(2));

        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(1L, 10L))
            .thenReturn(Optional.of(existingProgress));
        when(lessonProgressRepository.save(any(LessonProgress.class))).thenAnswer(i -> i.getArgument(0));

        LessonProgress result = lessonProgressService.trackLessonAccess(1L, 10L);

        assertThat(result.getCompleted()).isTrue(); // Stays completed
        assertThat(result.getCompletedAt()).isNotNull();
        verify(lessonProgressRepository).save(existingProgress);
    }

    // ── Edge Cases ────────────────────────────────────────────────────────────

    @Test
    void markLessonCompleted_shouldHandleMultipleCallsIdempotently() {
        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(1L, 10L))
            .thenReturn(Optional.of(existingProgress));
        when(lessonProgressRepository.save(any(LessonProgress.class))).thenAnswer(i -> i.getArgument(0));

        // First call - marks as completed
        LessonProgress result1 = lessonProgressService.markLessonCompleted(1L, 10L);
        assertThat(result1.getCompleted()).isTrue();

        // Simulate already completed
        existingProgress.setCompleted(true);
        existingProgress.setCompletedAt(result1.getCompletedAt());

        // Second call - should just update last accessed
        LessonProgress result2 = lessonProgressService.markLessonCompleted(1L, 10L);
        assertThat(result2.getCompleted()).isTrue();
        assertThat(result2.getCompletedAt()).isEqualTo(result1.getCompletedAt());
    }
}
