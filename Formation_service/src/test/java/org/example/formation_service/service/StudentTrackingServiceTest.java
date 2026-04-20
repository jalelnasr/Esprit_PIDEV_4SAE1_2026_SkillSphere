package org.example.formation_service.service;

import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.domain.entity.Lesson;
import org.example.formation_service.domain.entity.LessonProgress;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.repository.CourseRepository;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.LessonProgressRepository;
import org.example.formation_service.web.dto.StudentProgressResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentTrackingServiceTest {

    @Mock private CourseRepository courseRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private LessonProgressRepository lessonProgressRepository;

    @InjectMocks private StudentTrackingService studentTrackingService;

    private Course course;
    private Enrollment enrollment;
    private List<Lesson> lessons;
    private List<LessonProgress> progresses;

    @BeforeEach
    void setUp() {
        course = new Course();
        course.setId(100L);
        course.setTitle("Java Programming");
        course.setCreatedBy(10L);

        Lesson lesson1 = new Lesson();
        lesson1.setId(1L);
        lesson1.setTitle("Lesson 1");

        Lesson lesson2 = new Lesson();
        lesson2.setId(2L);
        lesson2.setTitle("Lesson 2");

        Lesson lesson3 = new Lesson();
        lesson3.setId(3L);
        lesson3.setTitle("Lesson 3");

        lessons = Arrays.asList(lesson1, lesson2, lesson3);
        course.setLessons(lessons);

        enrollment = new Enrollment();
        enrollment.setId(1L);
        enrollment.setUserId(100L);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setCompletionPercent(66);
        enrollment.setInscriptionDate(LocalDateTime.now().minusDays(10));

        LessonProgress progress1 = new LessonProgress();
        progress1.setId(1L);
        progress1.setEnrollment(enrollment);
        progress1.setLesson(lesson1);
        progress1.setCompleted(true);
        progress1.setCompletedAt(LocalDateTime.now().minusDays(5));
        progress1.setTimeSpentMinutes(30);
        progress1.setLastAccessedAt(LocalDateTime.now().minusDays(5));

        LessonProgress progress2 = new LessonProgress();
        progress2.setId(2L);
        progress2.setEnrollment(enrollment);
        progress2.setLesson(lesson2);
        progress2.setCompleted(true);
        progress2.setCompletedAt(LocalDateTime.now().minusDays(2));
        progress2.setTimeSpentMinutes(45);
        progress2.setLastAccessedAt(LocalDateTime.now().minusDays(2));

        LessonProgress progress3 = new LessonProgress();
        progress3.setId(3L);
        progress3.setEnrollment(enrollment);
        progress3.setLesson(lesson3);
        progress3.setCompleted(false);
        progress3.setTimeSpentMinutes(15);
        progress3.setLastAccessedAt(LocalDateTime.now().minusDays(1));

        progresses = Arrays.asList(progress1, progress2, progress3);
    }

    // ── getInstructorStudents ─────────────────────────────────────────────────

    @Test
    void getInstructorStudents_shouldReturnEmptyList_whenNoCourses() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Collections.emptyList());

        List<StudentProgressResponse> results = studentTrackingService.getInstructorStudents(10L);

        assertThat(results).isEmpty();
    }

    @Test
    void getInstructorStudents_shouldReturnAllEnrollments() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(Arrays.asList(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        List<StudentProgressResponse> results = studentTrackingService.getInstructorStudents(10L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getUserId()).isEqualTo(100L);
        assertThat(results.get(0).getCourseTitle()).isEqualTo("Java Programming");
    }

    @Test
    void getInstructorStudents_shouldCalculateCorrectCompletionPercent() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(Arrays.asList(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        List<StudentProgressResponse> results = studentTrackingService.getInstructorStudents(10L);

        // 2 completed out of 3 lessons = 67%
        assertThat(results.get(0).getCompletionPercent()).isEqualTo(67);
        assertThat(results.get(0).getTotalLessons()).isEqualTo(3);
        assertThat(results.get(0).getCompletedLessons()).isEqualTo(2);
    }

    @Test
    void getInstructorStudents_shouldCalculateTotalTimeSpent() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(Arrays.asList(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        List<StudentProgressResponse> results = studentTrackingService.getInstructorStudents(10L);

        // 30 + 45 + 15 = 90 minutes
        assertThat(results.get(0).getTimeSpentMinutes()).isEqualTo(90);
    }

    @Test
    void getInstructorStudents_shouldFindLastActivity() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(Arrays.asList(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        List<StudentProgressResponse> results = studentTrackingService.getInstructorStudents(10L);

        // Last activity should be progress3's lastAccessedAt (most recent)
        assertThat(results.get(0).getLastActivity()).isNotNull();
        assertThat(results.get(0).getLastActivity()).isAfter(enrollment.getInscriptionDate());
    }

    // ── getStudentsByFormation ────────────────────────────────────────────────

    @Test
    void getStudentsByFormation_shouldReturnEnrollmentsForCourse() {
        when(enrollmentRepository.findByCourseId(100L)).thenReturn(Arrays.asList(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        List<StudentProgressResponse> results = studentTrackingService.getStudentsByFormation(100L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCourseId()).isEqualTo(100L);
    }

    @Test
    void getStudentsByFormation_shouldReturnEmptyList_whenNoEnrollments() {
        when(enrollmentRepository.findByCourseId(100L)).thenReturn(Collections.emptyList());

        List<StudentProgressResponse> results = studentTrackingService.getStudentsByFormation(100L);

        assertThat(results).isEmpty();
    }

    // ── getStudentProgress ────────────────────────────────────────────────────

    @Test
    void getStudentProgress_shouldThrow_whenEnrollmentNotFound() {
        when(enrollmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentTrackingService.getStudentProgress(999L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Enrollment not found");
    }

    @Test
    void getStudentProgress_shouldReturnProgressDetails() {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        StudentProgressResponse result = studentTrackingService.getStudentProgress(1L);

        assertThat(result).isNotNull();
        assertThat(result.getEnrollmentId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo(100L);
        assertThat(result.getCourseTitle()).isEqualTo("Java Programming");
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void getStudentProgress_shouldHandleZeroLessons() {
        course.setLessons(Collections.emptyList());
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(Collections.emptyList());

        StudentProgressResponse result = studentTrackingService.getStudentProgress(1L);

        assertThat(result.getTotalLessons()).isEqualTo(0);
        assertThat(result.getCompletedLessons()).isEqualTo(0);
        assertThat(result.getCompletionPercent()).isEqualTo(0);
    }

    @Test
    void getStudentProgress_shouldHandleNoProgress() {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(Collections.emptyList());

        StudentProgressResponse result = studentTrackingService.getStudentProgress(1L);

        assertThat(result.getCompletedLessons()).isEqualTo(0);
        assertThat(result.getTimeSpentMinutes()).isEqualTo(0);
        assertThat(result.getLastActivity()).isEqualTo(enrollment.getInscriptionDate());
    }

    // ── exportStudentListToCsv ────────────────────────────────────────────────

    @Test
    void exportStudentListToCsv_shouldGenerateValidCsv() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(Arrays.asList(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        byte[] csvBytes = studentTrackingService.exportStudentListToCsv(10L);
        String csv = new String(csvBytes);

        assertThat(csv).contains("User ID,User Name,User Email");
        assertThat(csv).contains("100"); // User ID
        assertThat(csv).contains("Java Programming"); // Course title
        assertThat(csv).contains("ACTIVE"); // Status
    }

    @Test
    void exportStudentListToCsv_shouldHandleEmptyData() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Collections.emptyList());

        byte[] csvBytes = studentTrackingService.exportStudentListToCsv(10L);
        String csv = new String(csvBytes);

        assertThat(csv).contains("User ID,User Name,User Email"); // Header only
        String[] lines = csv.split("\n");
        assertThat(lines).hasSize(1); // Only header
    }

    @Test
    void exportStudentListToCsv_shouldEscapeCommasInFields() {
        course.setTitle("Java, Python, and JavaScript");
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(Arrays.asList(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        byte[] csvBytes = studentTrackingService.exportStudentListToCsv(10L);
        String csv = new String(csvBytes);

        assertThat(csv).contains("\"Java, Python, and JavaScript\""); // Escaped with quotes
    }

    // ── Edge Cases ────────────────────────────────────────────────────────────

    @Test
    void getStudentProgress_shouldHandle100PercentCompletion() {
        progresses.get(2).setCompleted(true); // Complete all lessons
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        StudentProgressResponse result = studentTrackingService.getStudentProgress(1L);

        assertThat(result.getCompletionPercent()).isEqualTo(100);
        assertThat(result.getCompletedLessons()).isEqualTo(3);
    }

    @Test
    void getStudentProgress_shouldHandleCompletedEnrollment() {
        enrollment.setStatus(EnrollmentStatus.COMPLETED);
        enrollment.setCompletedAt(LocalDateTime.now().minusDays(1));
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(lessonProgressRepository.findByEnrollmentId(1L)).thenReturn(progresses);

        StudentProgressResponse result = studentTrackingService.getStudentProgress(1L);

        assertThat(result.getStatus()).isEqualTo("COMPLETED");
        assertThat(result.getCompletedAt()).isNotNull();
    }
}
