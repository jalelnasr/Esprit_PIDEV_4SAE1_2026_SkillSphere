package org.example.b2bmodule.controller;

import org.example.b2bmodule.dto.MissionApplicationResponse;
import org.example.b2bmodule.service.MissionApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/mission-applications")
@RequiredArgsConstructor
@Slf4j
public class MissionApplicationController {

    private final MissionApplicationService missionApplicationService;

    /**
     * Apply for a mission
     */
    @PostMapping
    public ResponseEntity<MissionApplicationResponse> apply(
            @RequestParam Long missionId,
            @RequestParam Long candidateId,
            @RequestParam BigDecimal proposedRate) {
        log.info("POST /api/b2b/mission-applications - Apply for mission");
        MissionApplicationResponse response = missionApplicationService.apply(missionId, candidateId, proposedRate);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all applications for a mission
     */
    @GetMapping("/mission/{missionId}")
    public ResponseEntity<List<MissionApplicationResponse>> getByMission(@PathVariable Long missionId) {
        log.info("GET /api/b2b/mission-applications/mission/{} - Get applications", missionId);
        List<MissionApplicationResponse> applications = missionApplicationService.findByMission(missionId);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get top matches for a mission
     */
    @GetMapping("/mission/{missionId}/top")
    public ResponseEntity<List<MissionApplicationResponse>> getTopMatches(
            @PathVariable Long missionId,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/b2b/mission-applications/mission/{}/top - Get top {} matches", missionId, limit);
        List<MissionApplicationResponse> topMatches = missionApplicationService.findTopMatches(missionId, limit);
        return ResponseEntity.ok(topMatches);
    }

    /**
     * Get applications by candidate
     */
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<MissionApplicationResponse>> getByCandidate(@PathVariable Long candidateId) {
        log.info("GET /api/b2b/mission-applications/candidate/{} - Get applications", candidateId);
        List<MissionApplicationResponse> applications = missionApplicationService.findByCandidate(candidateId);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get application by ID
     */
    @GetMapping("/{applicationId}")
    public ResponseEntity<MissionApplicationResponse> getById(@PathVariable Long applicationId) {
        log.info("GET /api/b2b/mission-applications/{} - Get application", applicationId);
        MissionApplicationResponse application = missionApplicationService.findById(applicationId);
        return ResponseEntity.ok(application);
    }

    /**
     * Update application status
     */
    @PutMapping("/{applicationId}/status")
    public ResponseEntity<MissionApplicationResponse> updateStatus(
            @PathVariable Long applicationId,
            @RequestParam String status) {
        log.info("PUT /api/b2b/mission-applications/{}/status - Update status to {}", applicationId, status);
        MissionApplicationResponse response = missionApplicationService.updateStatus(applicationId, status);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete application
     */
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Void> delete(@PathVariable Long applicationId) {
        log.info("DELETE /api/b2b/mission-applications/{} - Delete application", applicationId);
        missionApplicationService.delete(applicationId);
        return ResponseEntity.noContent().build();
    }
}
