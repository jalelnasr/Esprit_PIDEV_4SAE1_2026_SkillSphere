package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.service.StudentTrackingService;
import org.example.formation_service.web.dto.StudentProgressResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class StudentTrackingController {
    
    private final StudentTrackingService studentTrackingService;
    
    @GetMapping("/instructors/{instructorId}/students")
    public ResponseEntity<List<StudentProgressResponse>> getInstructorStudents(
            @PathVariable Long instructorId) {
        
        log.info("GET /api/instructors/{}/students", instructorId);
        
        List<StudentProgressResponse> students = studentTrackingService.getInstructorStudents(instructorId);
        
        return ResponseEntity.ok(students);
    }
    
    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<StudentProgressResponse>> getStudentsByFormation(
            @PathVariable Long courseId) {
        
        log.info("GET /api/courses/{}/students", courseId);
        
        List<StudentProgressResponse> students = studentTrackingService.getStudentsByFormation(courseId);
        
        return ResponseEntity.ok(students);
    }
    
    @GetMapping("/enrollments/{enrollmentId}/progress")
    public ResponseEntity<StudentProgressResponse> getStudentProgress(
            @PathVariable Long enrollmentId) {
        
        log.info("GET /api/enrollments/{}/progress", enrollmentId);
        
        StudentProgressResponse progress = studentTrackingService.getStudentProgress(enrollmentId);
        
        return ResponseEntity.ok(progress);
    }
    
    @GetMapping("/instructors/{instructorId}/students/export")
    public ResponseEntity<byte[]> exportStudentList(
            @PathVariable Long instructorId) {
        
        log.info("GET /api/instructors/{}/students/export", instructorId);
        
        byte[] csvData = studentTrackingService.exportStudentListToCsv(instructorId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "students_" + instructorId + ".csv");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(csvData);
    }
}
