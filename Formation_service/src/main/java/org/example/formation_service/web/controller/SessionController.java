package org.example.formation_service.web.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.Session;
import org.example.formation_service.service.SessionService;
import org.example.formation_service.web.dto.EnrollmentRequest;
import org.example.formation_service.web.dto.SessionRequest;
import org.example.formation_service.web.dto.SessionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SessionController {
    
    private final SessionService sessionService;
    
    @PostMapping("/courses/{id}/sessions")
    public ResponseEntity<SessionResponse> createSession(@PathVariable Long id, @Valid @RequestBody SessionRequest request) {
        Session session = sessionService.createSession(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(session));
    }
    @PutMapping("/sessions/{id}")
    public ResponseEntity<SessionResponse> updateSession(@PathVariable Long id, @Valid @RequestBody SessionRequest request) {
        Session session = sessionService.updateSession(id, request);
        return ResponseEntity.ok(toResponse(session));
    }
    
    @GetMapping("/courses/{id}/sessions")
    public ResponseEntity<List<SessionResponse>> getCourseSessions(@PathVariable Long id) {
        List<Session> sessions = sessionService.getSessionsByCourseId(id);
        List<SessionResponse> responses = sessions.stream()
            .map(this::toResponse)
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> getAllSessions() {
        List<Session> sessions = sessionService.getAllSessions();
        List<SessionResponse> responses = sessions.stream()
            .map(this::toResponse)
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/sessions/recent")
    public ResponseEntity<List<SessionResponse>> getRecentSessions(@RequestParam(defaultValue = "10") int limit) {
        List<Session> sessions = sessionService.getRecentSessions(limit);
        List<SessionResponse> responses = sessions.stream()
            .map(this::toResponse)
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @PostMapping("/sessions/{id}/open")
    public ResponseEntity<SessionResponse> openSession(@PathVariable Long id) {
        Session session = sessionService.openSession(id);
        return ResponseEntity.ok(toResponse(session));
    }
    
    @PostMapping("/sessions/{id}/close")
    public ResponseEntity<SessionResponse> closeSession(@PathVariable Long id) {
        Session session = sessionService.closeSession(id);
        return ResponseEntity.ok(toResponse(session));
    }
    
    @PostMapping("/sessions/{id}/enroll")
    public ResponseEntity<Void> enrollInSession(@PathVariable Long id, @Valid @RequestBody EnrollmentRequest request) {
        sessionService.enrollInSession(id, request.getUserId());
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/instructors/{instructorId}/sessions")
    public ResponseEntity<List<SessionResponse>> getInstructorSessions(@PathVariable Long instructorId) {
        List<Session> sessions = sessionService.getSessionsByInstructorId(instructorId);
        List<SessionResponse> responses = sessions.stream()
            .map(this::toResponse)
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/users/{userId}/sessions/{sessionId}/enrollment-status")
    public ResponseEntity<java.util.Map<String, Boolean>> checkSessionEnrollment(
        @PathVariable Long userId,
        @PathVariable Long sessionId
    ) {
        boolean isEnrolled = sessionService.isUserEnrolledInSession(userId, sessionId);
        return ResponseEntity.ok(java.util.Map.of("isEnrolled", isEnrolled));
    }
    
    @GetMapping("/users/{userId}/enrolled-session-ids")
    public ResponseEntity<List<Long>> getUserEnrolledSessionIds(@PathVariable Long userId) {
        List<Long> sessionIds = sessionService.getUserEnrolledSessionIds(userId);
        return ResponseEntity.ok(sessionIds);
    }
    
    private SessionResponse toResponse(Session session) {
        return SessionResponse.builder()
            .id(session.getId())
            .courseId(session.getCourse().getId())
            .courseTitle(session.getCourse().getTitle())
            .startAt(session.getStartAt())
            .endAt(session.getEndAt())
            .timezone(session.getTimezone())
            .location(session.getLocation())
            .capacity(session.getCapacity())
            .enrolledCount(session.getEnrolledCount())
            .status(session.getStatus())
            .build();
    }
}
