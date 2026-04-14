package org.example.formation_service.service;

import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.domain.entity.Session;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.repository.CourseRepository;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.SessionRepository;
import org.example.formation_service.web.dto.InstructorStatisticsResponse;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InstructorStatisticsServiceTest {

    @Mock private CourseRepository courseRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private SessionRepository sessionRepository;

    @InjectMocks private InstructorStatisticsService instructorStatisticsService;

    private Course course1;
    private Course course2;
    private List<Enrollment> enrollments;
    private List<Session> sessions;

    @BeforeEach
    void setUp() {
        course1 = new Course();
        course1.setId(1L);
        course1.setTitle("Java Basics");
        course1.setCreatedBy(10L);

        course2 = new Course();
        course2.setId(2L);
        course2.setTitle("Advanced Java");
        course2.setCreatedBy(10L);

        Enrollment enrollment1 = new Enrollment();
        enrollment1.setId(1L);
        enrollment1.setCourse(course1);
        enrollment1.setUserId(100L);
        enrollment1.setStatus(EnrollmentStatus.ACTIVE);
        enrollment1.setCompletionPercent(75);
        enrollment1.setInscriptionDate(LocalDateTime.now().minusMonths(2));

        Enrollment enrollment2 = new Enrollment();
        enrollment2.setId(2L);
        enrollment2.setCourse(course1);
        enrollment2.setUserId(101L);
        enrollment2.setStatus(EnrollmentStatus.COMPLETED);
        enrollment2.setCompletionPercent(100);
        enrollment2.setInscriptionDate(LocalDateTime.now().minusMonths(1));
        enrollment2.setCompletedAt(LocalDateTime.now().minusDays(5));

        Enrollment enrollment3 = new Enrollment();
        enrollment3.setId(3L);
        enrollment3.setCourse(course2);
        enrollment3.setUserId(102L);
        enrollment3.setStatus(EnrollmentStatus.ACTIVE);
        enrollment3.setCompletionPercent(50);
        enrollment3.setInscriptionDate(LocalDateTime.now().minusWeeks(2));

        enrollments = Arrays.asList(enrollment1, enrollment2, enrollment3);

        Session session1 = new Session();
        session1.setId(1L);
        session1.setCourse(course1);
        session1.setStartAt(LocalDateTime.now().plusDays(5));

        Session session2 = new Session();
        session2.setId(2L);
        session2.setCourse(course2);
        session2.setStartAt(LocalDateTime.now().plusDays(10));

        sessions = Arrays.asList(session1, session2);
    }

    // ── getInstructorStatistics ───────────────────────────────────────────────

    @Test
    void getInstructorStatistics_shouldReturnEmptyStats_whenNoCourses() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Collections.emptyList());

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        assertThat(result.getTotalFormations()).isEqualTo(0L);
        assertThat(result.getTotalSessions()).isEqualTo(0L);
        assertThat(result.getTotalStudents()).isEqualTo(0L);
        assertThat(result.getAverageCompletionRate()).isEqualTo(0.0);
        assertThat(result.getEnrollmentTrends()).isEmpty();
        assertThat(result.getTopFormations()).isEmpty();
        assertThat(result.getRecentActivities()).isEmpty();
    }

    @Test
    void getInstructorStatistics_shouldCalculateCorrectTotals() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1, course2));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(enrollments);
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(sessions);

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        assertThat(result.getTotalFormations()).isEqualTo(2L);
        assertThat(result.getTotalSessions()).isEqualTo(2L);
        assertThat(result.getTotalStudents()).isEqualTo(3L); // Unique users: 100, 101, 102
    }

    @Test
    void getInstructorStatistics_shouldCalculateAverageCompletionRate() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1, course2));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(enrollments);
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(sessions);

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        // Average: (75 + 100 + 50) / 3 = 75.0
        assertThat(result.getAverageCompletionRate()).isEqualTo(75.0);
    }

    @Test
    void getInstructorStatistics_shouldCountUniqueStudents() {
        // Add duplicate user enrollment
        Enrollment duplicateEnrollment = new Enrollment();
        duplicateEnrollment.setId(4L);
        duplicateEnrollment.setCourse(course2);
        duplicateEnrollment.setUserId(100L); // Same user as enrollment1
        duplicateEnrollment.setStatus(EnrollmentStatus.ACTIVE);
        duplicateEnrollment.setCompletionPercent(60);
        duplicateEnrollment.setInscriptionDate(LocalDateTime.now().minusWeeks(1));

        List<Enrollment> enrollmentsWithDuplicate = Arrays.asList(
            enrollments.get(0), enrollments.get(1), enrollments.get(2), duplicateEnrollment
        );

        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1, course2));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(enrollmentsWithDuplicate);
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(sessions);

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        assertThat(result.getTotalStudents()).isEqualTo(3L); // Still 3 unique: 100, 101, 102
    }

    // ── Enrollment Trends ─────────────────────────────────────────────────────

    @Test
    void getInstructorStatistics_shouldBuildEnrollmentTrendsForLast6Months() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1, course2));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(enrollments);
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(sessions);

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        assertThat(result.getEnrollmentTrends()).hasSize(6); // Last 6 months
        assertThat(result.getEnrollmentTrends().get(0).getMonth()).isNotNull();
        assertThat(result.getEnrollmentTrends().get(0).getEnrollmentCount()).isNotNull();
    }

    @Test
    void getInrollmentTrends_shouldIncludeMonthsWithZeroEnrollments() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(Collections.emptyList());
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(Collections.emptyList());

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        assertThat(result.getEnrollmentTrends()).hasSize(6);
        assertThat(result.getEnrollmentTrends().stream()
            .allMatch(trend -> trend.getEnrollmentCount() == 0L)).isTrue();
    }

    // ── Top Formations ────────────────────────────────────────────────────────

    @Test
    void getInstructorStatistics_shouldBuildTopFormationsOrderedByEnrollments() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1, course2));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(enrollments);
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(sessions);

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        assertThat(result.getTopFormations()).hasSize(2);
        // course1 has 2 enrollments, course2 has 1
        assertThat(result.getTopFormations().get(0).getCourseTitle()).isEqualTo("Java Basics");
        assertThat(result.getTopFormations().get(0).getEnrollmentCount()).isEqualTo(2L);
        assertThat(result.getTopFormations().get(1).getCourseTitle()).isEqualTo("Advanced Java");
        assertThat(result.getTopFormations().get(1).getEnrollmentCount()).isEqualTo(1L);
    }

    @Test
    void getInstructorStatistics_shouldCalculateCompletionRatePerCourse() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1, course2));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(enrollments);
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(sessions);

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        // course1: 1 completed out of 2 = 50%
        assertThat(result.getTopFormations().get(0).getCompletionRate()).isEqualTo(50.0);
        // course2: 0 completed out of 1 = 0%
        assertThat(result.getTopFormations().get(1).getCompletionRate()).isEqualTo(0.0);
    }

    @Test
    void getInstructorStatistics_shouldLimitTopFormationsToFive() {
        List<Course> sixCourses = Arrays.asList(
            createCourse(1L, "Course 1"),
            createCourse(2L, "Course 2"),
            createCourse(3L, "Course 3"),
            createCourse(4L, "Course 4"),
            createCourse(5L, "Course 5"),
            createCourse(6L, "Course 6")
        );

        when(courseRepository.findByCreatedBy(10L)).thenReturn(sixCourses);
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(Collections.emptyList());
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(Collections.emptyList());

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        assertThat(result.getTopFormations()).hasSize(5); // Limited to 5
    }

    // ── Recent Activities ─────────────────────────────────────────────────────

    @Test
    void getInstructorStatistics_shouldIncludeRecentEnrollments() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1, course2));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(enrollments);
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(sessions);

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        long enrollmentActivities = result.getRecentActivities().stream()
            .filter(a -> a.getType().equals("ENROLLMENT"))
            .count();

        assertThat(enrollmentActivities).isGreaterThan(0);
    }

    @Test
    void getInstructorStatistics_shouldIncludeRecentCompletions() {
        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1, course2));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(enrollments);
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(sessions);

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        long completionActivities = result.getRecentActivities().stream()
            .filter(a -> a.getType().equals("COMPLETION"))
            .count();

        assertThat(completionActivities).isGreaterThan(0);
    }

    @Test
    void getInstructorStatistics_shouldLimitRecentActivitiesToTen() {
        // Create 12 enrollments — service takes top 5 enrollments + top 3 completions + top 3 sessions = 11 → limited to 10
        List<Enrollment> manyEnrollments = Arrays.asList(
            createEnrollment(1L, course1, 100L),
            createEnrollment(2L, course1, 101L),
            createEnrollment(3L, course1, 102L),
            createEnrollment(4L, course1, 103L),
            createEnrollment(5L, course1, 104L),
            createEnrollment(6L, course1, 105L),
            createEnrollment(7L, course1, 106L),
            createEnrollment(8L, course1, 107L),
            createEnrollment(9L, course1, 108L),
            createEnrollment(10L, course1, 109L),
            createEnrollment(11L, course1, 110L),
            createEnrollment(12L, course1, 111L)
        );

        // Mark some as completed so we get completion activities too
        manyEnrollments.get(0).setStatus(EnrollmentStatus.COMPLETED);
        manyEnrollments.get(0).setCompletedAt(LocalDateTime.now().minusDays(1));
        manyEnrollments.get(1).setStatus(EnrollmentStatus.COMPLETED);
        manyEnrollments.get(1).setCompletedAt(LocalDateTime.now().minusDays(2));
        manyEnrollments.get(2).setStatus(EnrollmentStatus.COMPLETED);
        manyEnrollments.get(2).setCompletedAt(LocalDateTime.now().minusDays(3));

        // Create 3 sessions
        List<Session> manySessions = Arrays.asList(
            createSession(1L, course1),
            createSession(2L, course1),
            createSession(3L, course1)
        );

        when(courseRepository.findByCreatedBy(10L)).thenReturn(Arrays.asList(course1));
        when(enrollmentRepository.findByCourseIdIn(anyList())).thenReturn(manyEnrollments);
        when(sessionRepository.findByCourseIdIn(anyList())).thenReturn(manySessions);

        InstructorStatisticsResponse result = instructorStatisticsService.getInstructorStatistics(10L);

        assertThat(result.getRecentActivities()).hasSize(10); // Limited to 10
    }

    private Session createSession(Long id, Course course) {
        Session session = new Session();
        session.setId(id);
        session.setCourse(course);
        session.setStartAt(LocalDateTime.now().minusDays(id));
        return session;
    }

    // ── Helper Methods ────────────────────────────────────────────────────────

    private Course createCourse(Long id, String title) {
        Course course = new Course();
        course.setId(id);
        course.setTitle(title);
        course.setCreatedBy(10L);
        return course;
    }

    private Enrollment createEnrollment(Long id, Course course, Long userId) {
        Enrollment enrollment = new Enrollment();
        enrollment.setId(id);
        enrollment.setCourse(course);
        enrollment.setUserId(userId);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setCompletionPercent(50);
        enrollment.setInscriptionDate(LocalDateTime.now().minusDays(id));
        return enrollment;
    }
}
