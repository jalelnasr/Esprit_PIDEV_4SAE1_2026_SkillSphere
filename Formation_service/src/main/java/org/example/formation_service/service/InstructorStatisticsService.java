package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.domain.entity.Session;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.repository.CourseRepository;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.SessionRepository;
import org.example.formation_service.web.dto.InstructorStatisticsResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InstructorStatisticsService {
    
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SessionRepository sessionRepository;
    
    @Transactional(readOnly = true)
    public InstructorStatisticsResponse getInstructorStatistics(Long instructorId) {
        log.info("Fetching statistics for instructor: {}", instructorId);
        
        // Get all courses by instructor
        List<Course> instructorCourses = courseRepository.findByCreatedBy(instructorId);
        List<Long> courseIds = instructorCourses.stream()
            .map(Course::getId)
            .collect(Collectors.toList());
        
        if (courseIds.isEmpty()) {
            return buildEmptyStatistics();
        }
        
        // Get all enrollments for instructor's courses
        List<Enrollment> allEnrollments = enrollmentRepository.findByCourseIdIn(courseIds);
        
        // Get all sessions for instructor's courses
        List<Session> allSessions = sessionRepository.findByCourseIdIn(courseIds);
        
        // Calculate statistics
        Long totalFormations = (long) instructorCourses.size();
        Long totalSessions = (long) allSessions.size();
        Long totalStudents = allEnrollments.stream()
            .map(Enrollment::getUserId)
            .distinct()
            .count();
        
        Double averageCompletionRate = calculateAverageCompletionRate(allEnrollments);
        
        // Build enrollment trends (last 6 months)
        List<InstructorStatisticsResponse.EnrollmentTrendData> enrollmentTrends = 
            buildEnrollmentTrends(allEnrollments);
        
        // Build top formations
        List<InstructorStatisticsResponse.TopFormationData> topFormations = 
            buildTopFormations(instructorCourses, allEnrollments);
        
        // Build recent activities
        List<InstructorStatisticsResponse.RecentActivityData> recentActivities = 
            buildRecentActivities(allEnrollments, allSessions, instructorCourses);
        
        return InstructorStatisticsResponse.builder()
            .totalFormations(totalFormations)
            .totalSessions(totalSessions)
            .totalStudents(totalStudents)
            .averageCompletionRate(averageCompletionRate)
            .enrollmentTrends(enrollmentTrends)
            .topFormations(topFormations)
            .recentActivities(recentActivities)
            .build();
    }
    
    private InstructorStatisticsResponse buildEmptyStatistics() {
        return InstructorStatisticsResponse.builder()
            .totalFormations(0L)
            .totalSessions(0L)
            .totalStudents(0L)
            .averageCompletionRate(0.0)
            .enrollmentTrends(new ArrayList<>())
            .topFormations(new ArrayList<>())
            .recentActivities(new ArrayList<>())
            .build();
    }
    
    private Double calculateAverageCompletionRate(List<Enrollment> enrollments) {
        if (enrollments.isEmpty()) {
            return 0.0;
        }
        
        double sum = enrollments.stream()
            .mapToInt(Enrollment::getCompletionPercent)
            .average()
            .orElse(0.0);
        
        return Math.round(sum * 100.0) / 100.0; // Round to 2 decimal places
    }
    
    private List<InstructorStatisticsResponse.EnrollmentTrendData> buildEnrollmentTrends(
            List<Enrollment> enrollments) {
        
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        
        // Group enrollments by month
        Map<String, Long> enrollmentsByMonth = enrollments.stream()
            .filter(e -> e.getInscriptionDate().isAfter(sixMonthsAgo))
            .collect(Collectors.groupingBy(
                e -> e.getInscriptionDate().format(formatter),
                Collectors.counting()
            ));
        
        // Build trend data for last 6 months (even if no enrollments)
        List<InstructorStatisticsResponse.EnrollmentTrendData> trends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = LocalDateTime.now().minusMonths(i);
            String monthKey = month.format(formatter);
            Long count = enrollmentsByMonth.getOrDefault(monthKey, 0L);
            
            trends.add(InstructorStatisticsResponse.EnrollmentTrendData.builder()
                .month(monthKey)
                .enrollmentCount(count)
                .build());
        }
        
        return trends;
    }
    
    private List<InstructorStatisticsResponse.TopFormationData> buildTopFormations(
            List<Course> courses, List<Enrollment> enrollments) {
        
        // Group enrollments by course
        Map<Long, List<Enrollment>> enrollmentsByCourse = enrollments.stream()
            .collect(Collectors.groupingBy(e -> e.getCourse().getId()));
        
        // Calculate stats for each course
        List<InstructorStatisticsResponse.TopFormationData> topFormations = courses.stream()
            .map(course -> {
                List<Enrollment> courseEnrollments = enrollmentsByCourse.getOrDefault(course.getId(), new ArrayList<>());
                Long enrollmentCount = (long) courseEnrollments.size();
                
                Double completionRate = courseEnrollments.isEmpty() ? 0.0 :
                    courseEnrollments.stream()
                        .filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED)
                        .count() * 100.0 / courseEnrollments.size();
                
                completionRate = Math.round(completionRate * 100.0) / 100.0;
                
                return InstructorStatisticsResponse.TopFormationData.builder()
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .enrollmentCount(enrollmentCount)
                    .completionRate(completionRate)
                    .build();
            })
            .sorted(Comparator.comparing(InstructorStatisticsResponse.TopFormationData::getEnrollmentCount).reversed())
            .limit(5)
            .collect(Collectors.toList());
        
        return topFormations;
    }
    
    private List<InstructorStatisticsResponse.RecentActivityData> buildRecentActivities(
            List<Enrollment> enrollments, List<Session> sessions, List<Course> courses) {
        
        List<InstructorStatisticsResponse.RecentActivityData> activities = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        
        // Map course IDs to titles for quick lookup
        Map<Long, String> courseTitles = courses.stream()
            .collect(Collectors.toMap(Course::getId, Course::getTitle));
        
        // Add recent enrollments
        enrollments.stream()
            .sorted(Comparator.comparing(Enrollment::getInscriptionDate).reversed())
            .limit(5)
            .forEach(enrollment -> {
                String courseTitle = courseTitles.get(enrollment.getCourse().getId());
                activities.add(InstructorStatisticsResponse.RecentActivityData.builder()
                    .type("ENROLLMENT")
                    .description("New enrollment in " + courseTitle)
                    .timestamp(enrollment.getInscriptionDate().format(formatter))
                    .relatedCourseId(enrollment.getCourse().getId())
                    .relatedCourseTitle(courseTitle)
                    .build());
            });
        
        // Add recent completions
        enrollments.stream()
            .filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED && e.getCompletedAt() != null)
            .sorted(Comparator.comparing(Enrollment::getCompletedAt).reversed())
            .limit(3)
            .forEach(enrollment -> {
                String courseTitle = courseTitles.get(enrollment.getCourse().getId());
                activities.add(InstructorStatisticsResponse.RecentActivityData.builder()
                    .type("COMPLETION")
                    .description("Course completed: " + courseTitle)
                    .timestamp(enrollment.getCompletedAt().format(formatter))
                    .relatedCourseId(enrollment.getCourse().getId())
                    .relatedCourseTitle(courseTitle)
                    .build());
            });
        
        // Add recent sessions
        sessions.stream()
            .sorted(Comparator.comparing(Session::getStartAt).reversed())
            .limit(3)
            .forEach(session -> {
                String courseTitle = courseTitles.get(session.getCourse().getId());
                activities.add(InstructorStatisticsResponse.RecentActivityData.builder()
                    .type("SESSION_CREATED")
                    .description("New session created for " + courseTitle)
                    .timestamp(session.getStartAt().format(formatter))
                    .relatedCourseId(session.getCourse().getId())
                    .relatedCourseTitle(courseTitle)
                    .build());
            });
        
        // Sort all activities by timestamp and limit to 10
        return activities.stream()
            .sorted(Comparator.comparing(InstructorStatisticsResponse.RecentActivityData::getTimestamp).reversed())
            .limit(10)
            .collect(Collectors.toList());
    }
}
