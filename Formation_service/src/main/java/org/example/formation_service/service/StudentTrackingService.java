package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.domain.entity.LessonProgress;
import org.example.formation_service.repository.CourseRepository;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.LessonProgressRepository;
import org.example.formation_service.feign.UserServiceClient;
import org.example.formation_service.feign.dto.UserDto;
import org.example.formation_service.web.dto.StudentProgressResponse;
import org.example.formation_service.feign.exception.UserNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentTrackingService {
    
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final UserServiceClient userServiceClient;

    @Value("${service.api.key}")
    private String serviceApiKey;
    
    @Transactional(readOnly = true)
    public List<StudentProgressResponse> getInstructorStudents(Long instructorId) {
        log.info("Fetching students for instructor: {}", instructorId);
        
        // Get all courses by instructor
        List<Course> instructorCourses = courseRepository.findByCreatedBy(instructorId);
        List<Long> courseIds = instructorCourses.stream()
            .map(Course::getId)
            .collect(Collectors.toList());
        
        if (courseIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Get all enrollments for instructor's courses
        List<Enrollment> enrollments = enrollmentRepository.findByCourseIdIn(courseIds);
        
        // Build student progress responses
        return enrollments.stream()
            .map(this::buildStudentProgressResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<StudentProgressResponse> getStudentsByFormation(Long courseId) {
        log.info("Fetching students for course: {}", courseId);
        
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        
        return enrollments.stream()
            .map(this::buildStudentProgressResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public StudentProgressResponse getStudentProgress(Long enrollmentId) {
        log.info("Fetching progress for enrollment: {}", enrollmentId);
        
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found: " + enrollmentId));
        
        return buildStudentProgressResponse(enrollment);
    }
    
    private StudentProgressResponse buildStudentProgressResponse(Enrollment enrollment) {
        Course course = enrollment.getCourse();
        
        // Fetch real user data from User Service via Feign (with fallback on error)
        String userName;
        String userEmail;
        try {
            UserDto user = userServiceClient.getUserById(enrollment.getUserId(), serviceApiKey);
            userName = user.getPrenom() + " " + user.getNom();
            userEmail = user.getEmail();
        } catch (UserNotFoundException e) {
            // User was deleted or doesn't exist in User Service DB — use placeholder
            log.warn("👤 User {} not found in User Service — using placeholder", enrollment.getUserId());
            userName = "Utilisateur #" + enrollment.getUserId();
            userEmail = "user" + enrollment.getUserId() + "@skillsphere.com";
        } catch (Exception e) {
            // Network error, timeout, etc.
            log.warn("⚠️ Could not fetch user {} from User Service: {}", enrollment.getUserId(), e.getMessage());
            userName = "Utilisateur #" + enrollment.getUserId();
            userEmail = "user" + enrollment.getUserId() + "@skillsphere.com";
        }
        // Get all lessons for this course
        int totalLessons = course.getLessons() != null ? course.getLessons().size() : 0;
        
        // Get lesson progress details
        List<LessonProgress> progresses = lessonProgressRepository.findByEnrollmentId(enrollment.getId());
        
        // Count completed lessons
        long completedLessons = progresses.stream()
            .filter(LessonProgress::getCompleted)
            .count();
        
        // Calculate completion percentage based on actual progress
        double completionPercentDouble = totalLessons > 0 
            ? (completedLessons * 100.0 / totalLessons) 
            : 0.0;
        int completionPercent = (int) Math.round(completionPercentDouble);
        
        Integer timeSpentMinutes = progresses.stream()
            .mapToInt(LessonProgress::getTimeSpentMinutes)
            .sum();
        
        // Find last activity
        java.time.LocalDateTime lastActivity = progresses.stream()
            .filter(p -> p.getLastAccessedAt() != null)
            .map(LessonProgress::getLastAccessedAt)
            .max(java.time.LocalDateTime::compareTo)
            .orElse(enrollment.getInscriptionDate());
        
        log.info("Enrollment {}: {} completed out of {} lessons = {}%", 
            enrollment.getId(), completedLessons, totalLessons, completionPercent);
        
        return StudentProgressResponse.builder()
            .enrollmentId(enrollment.getId())
            .userId(enrollment.getUserId())
            .userName(userName)
            .userEmail(userEmail)
            .courseId(course.getId())
            .courseTitle(course.getTitle())
            .completionPercent(completionPercent) // Use calculated percentage, not enrollment.getCompletionPercent()
            .status(enrollment.getStatus().name())
            .enrolledAt(enrollment.getInscriptionDate())
            .lastActivity(lastActivity)
            .completedAt(enrollment.getCompletedAt())
            .totalLessons(totalLessons)
            .completedLessons((int) completedLessons)
            .timeSpentMinutes(timeSpentMinutes)
            .build();
    }
    
    public byte[] exportStudentListToCsv(Long instructorId) {
        log.info("Exporting student list to CSV for instructor: {}", instructorId);
        
        List<StudentProgressResponse> students = getInstructorStudents(instructorId);
        
        StringBuilder csv = new StringBuilder();
        
        // CSV Header
        csv.append("User ID,User Name,User Email,Course Title,Completion %,Status,Enrolled At,Last Activity,Completed At,Total Lessons,Completed Lessons,Time Spent (min)\n");
        
        // CSV Rows
        for (StudentProgressResponse student : students) {
            csv.append(student.getUserId()).append(",");
            csv.append(escapeCsv(student.getUserName())).append(",");
            csv.append(escapeCsv(student.getUserEmail())).append(",");
            csv.append(escapeCsv(student.getCourseTitle())).append(",");
            csv.append(student.getCompletionPercent()).append(",");
            csv.append(student.getStatus()).append(",");
            csv.append(student.getEnrolledAt()).append(",");
            csv.append(student.getLastActivity()).append(",");
            csv.append(student.getCompletedAt() != null ? student.getCompletedAt() : "").append(",");
            csv.append(student.getTotalLessons()).append(",");
            csv.append(student.getCompletedLessons()).append(",");
            csv.append(student.getTimeSpentMinutes()).append("\n");
        }
        
        return csv.toString().getBytes();
    }
    
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
