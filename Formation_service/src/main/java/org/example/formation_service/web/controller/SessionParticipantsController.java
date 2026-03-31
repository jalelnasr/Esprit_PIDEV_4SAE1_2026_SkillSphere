package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.repository.EnrollmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Slf4j
public class SessionParticipantsController {
    
    private final JdbcTemplate jdbcTemplate;
    private final EnrollmentRepository enrollmentRepository;
    
    /**
     * Get participants for a session (simple version - just query enrollments by course)
     */
    @GetMapping("/{sessionId}/participants")
    public ResponseEntity<List<Map<String, Object>>> getSessionParticipants(@PathVariable Long sessionId) {
        log.info("📋 Getting participants for session {}", sessionId);
        
        try {
            // Simple SQL query - using correct column names from your database
            String sql = """
                SELECT 
                    e.id as enrollment_id,
                    e.user_id,
                    e.inscription_date as enrolled_at,
                    e.status
                FROM enrollments e
                JOIN sessions s ON e.course_id = s.course_id
                WHERE s.id = ?
                AND e.status = 'ACTIVE'
                ORDER BY e.inscription_date DESC
                """;
            
            List<Map<String, Object>> participants = jdbcTemplate.queryForList(sql, sessionId);
            
            log.info("✅ Found {} participants for session {}", participants.size(), sessionId);
            return ResponseEntity.ok(participants);
            
        } catch (Exception e) {
            log.error("❌ Error getting participants for session {}: {}", sessionId, e.getMessage(), e);
            return ResponseEntity.ok(new java.util.ArrayList<>()); // Return empty list on error
        }
    }
}
