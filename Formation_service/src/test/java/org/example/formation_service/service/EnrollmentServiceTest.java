package org.example.formation_service.service;

import org.example.formation_service.domain.entity.*;
import org.example.formation_service.domain.enums.CourseStatus;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.feign.UserServiceClient;
import org.example.formation_service.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private LessonRepository lessonRepository;
    @Mock private LessonProgressRepository lessonProgressRepository;
    @Mock private CourseService courseService;
    @Mock private UserServiceClient userServiceClient;
    @Mock private AccessControlService accessControlService;

    @InjectMocks private EnrollmentService enrollmentService;

    private Course course;
    private Enrollment enrollment;

    @BeforeEach
    void setUp() {
        // Inject the @Value field since Mockito doesn't inject @Value
        ReflectionTestUtils.setField(enrollmentService, "serviceApiKey", "test-api-key");

        course = new Course();
        course.setId(1L);
        course.setTitle("Java Course");
        course.setStatus(CourseStatus.PUBLISHED);

        enrollment = new Enrollment();
        enrollment.setId(1L);
        enrollment.setUserId(1L);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setCompletionPercent(0);

        // Default: user exists — use lenient to avoid UnnecessaryStubbingException
        // in tests that don't call enroll()
        lenient().when(userServiceClient.userExists(anyLong(), anyString())).thenReturn(true);
    }

    // ── enroll ────────────────────────────────────────────────────────────────

    @Test
    void enroll_shouldThrow_whenCourseIsDraft() {
        course.setStatus(CourseStatus.DRAFT);
        doNothing().when(accessControlService).checkCanEnroll(anyLong(), anyLong());
        when(courseService.getCourseById(1L)).thenReturn(course);

        assertThatThrownBy(() -> enrollmentService.enroll(1L, 1L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("draft");
    }

    @Test
    void enroll_shouldThrow_whenAlreadyEnrolled() {
        doNothing().when(accessControlService).checkCanEnroll(anyLong(), anyLong());
        when(courseService.getCourseById(1L)).thenReturn(course);
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> enrollmentService.enroll(1L, 1L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("already enrolled");
    }

    @Test
    void enroll_shouldCreateEnrollmentAndLessonProgress() {
        Lesson lesson = new Lesson();
        lesson.setId(1L);

        doNothing().when(accessControlService).checkCanEnroll(anyLong(), anyLong());
        when(courseService.getCourseById(1L)).thenReturn(course);
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 1L)).thenReturn(false);
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(enrollment);
        when(lessonRepository.findByCourseIdOrderByOrderIndexAsc(1L)).thenReturn(List.of(lesson));
        when(lessonProgressRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Enrollment result = enrollmentService.enroll(1L, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(EnrollmentStatus.ACTIVE);
        verify(lessonProgressRepository, times(1)).save(any(LessonProgress.class));
    }

    @Test
    void enroll_shouldThrow_whenUserNotFound() {
        doNothing().when(accessControlService).checkCanEnroll(anyLong(), anyLong());
        when(userServiceClient.userExists(anyLong(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> enrollmentService.enroll(1L, 1L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("introuvable");
    }

    // ── cancelEnrollment ──────────────────────────────────────────────────────

    @Test
    void cancelEnrollment_shouldThrow_whenNotFound() {
        when(enrollmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> enrollmentService.cancelEnrollment(99L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("not found");
    }

    @Test
    void cancelEnrollment_shouldThrow_whenAlreadyCanceled() {
        enrollment.setStatus(EnrollmentStatus.CANCELED);
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));

        assertThatThrownBy(() -> enrollmentService.cancelEnrollment(1L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("already canceled");
    }

    @Test
    void cancelEnrollment_shouldSetStatusCanceled() {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Enrollment result = enrollmentService.cancelEnrollment(1L);

        assertThat(result.getStatus()).isEqualTo(EnrollmentStatus.CANCELED);
    }

    // ── recalculateProgress ───────────────────────────────────────────────────

    @Test
    void recalculateProgress_shouldSetZero_whenNoLessons() {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonRepository.findByCourseIdOrderByOrderIndexAsc(1L)).thenReturn(List.of());
        when(enrollmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        enrollmentService.recalculateProgress(1L);

        verify(enrollmentRepository).save(argThat(e -> e.getCompletionPercent() == 0));
    }

    @Test
    void recalculateProgress_shouldSetCompleted_whenAllLessonsDone() {
        Lesson l1 = new Lesson(); l1.setId(1L);
        Lesson l2 = new Lesson(); l2.setId(2L);

        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonRepository.findByCourseIdOrderByOrderIndexAsc(1L)).thenReturn(List.of(l1, l2));
        when(lessonProgressRepository.countByEnrollmentIdAndCompletedTrue(1L)).thenReturn(2L);
        when(enrollmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        enrollmentService.recalculateProgress(1L);

        verify(enrollmentRepository).save(argThat(e ->
            e.getCompletionPercent() == 100 &&
            e.getStatus() == EnrollmentStatus.COMPLETED
        ));
    }

    @Test
    void recalculateProgress_shouldCalculatePartialPercent() {
        Lesson l1 = new Lesson(); l1.setId(1L);
        Lesson l2 = new Lesson(); l2.setId(2L);
        Lesson l3 = new Lesson(); l3.setId(3L);
        Lesson l4 = new Lesson(); l4.setId(4L);

        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonRepository.findByCourseIdOrderByOrderIndexAsc(1L)).thenReturn(List.of(l1, l2, l3, l4));
        when(lessonProgressRepository.countByEnrollmentIdAndCompletedTrue(1L)).thenReturn(2L);
        when(enrollmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        enrollmentService.recalculateProgress(1L);

        verify(enrollmentRepository).save(argThat(e -> e.getCompletionPercent() == 50));
    }

    // ── isUserEnrolledInCourse ────────────────────────────────────────────────

    @Test
    void isUserEnrolledInCourse_shouldReturnTrue_whenActiveEnrollmentExists() {
        when(enrollmentRepository.existsByUserIdAndCourseIdAndStatus(1L, 1L, EnrollmentStatus.ACTIVE))
            .thenReturn(true);

        assertThat(enrollmentService.isUserEnrolledInCourse(1L, 1L)).isTrue();
    }

    @Test
    void isUserEnrolledInCourse_shouldReturnFalse_whenNotEnrolled() {
        when(enrollmentRepository.existsByUserIdAndCourseIdAndStatus(1L, 1L, EnrollmentStatus.ACTIVE))
            .thenReturn(false);

        assertThat(enrollmentService.isUserEnrolledInCourse(1L, 1L)).isFalse();
    }
}
