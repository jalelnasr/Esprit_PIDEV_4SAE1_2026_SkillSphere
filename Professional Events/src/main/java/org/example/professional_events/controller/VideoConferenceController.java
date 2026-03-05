package org.example.professional_events.controller;

import lombok.RequiredArgsConstructor;
import org.example.professional_events.entity.Match;
import org.example.professional_events.service.VideoConferenceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/videoconference")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class VideoConferenceController {

    private final VideoConferenceService videoConferenceService;

    /**
     * Créer une URL de visioconférence pour un match
     * POST /api/videoconference/match/{matchId}/create
     */
    @PostMapping("/match/{matchId}/create")
    public ResponseEntity<Map<String, Object>> createMeetingUrl(@PathVariable Long matchId) {
        try {
            String meetingUrl = videoConferenceService.createMeetingUrl(matchId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("meetingUrl", meetingUrl);
            response.put("message", "Meeting URL created successfully");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Planifier un match avec date et heure
     * PUT /api/videoconference/match/{matchId}/schedule
     */
    @PutMapping("/match/{matchId}/schedule")
    public ResponseEntity<Match> scheduleMatch(
            @PathVariable Long matchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledAt) {
        try {
            Match match = videoConferenceService.scheduleMatch(matchId, scheduledAt);
            return new ResponseEntity<>(match, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Démarrer un match (créer l'URL et passer en IN_PROGRESS)
     * POST /api/videoconference/match/{matchId}/start
     */
    @PostMapping("/match/{matchId}/start")
    public ResponseEntity<Map<String, Object>> startMatch(@PathVariable Long matchId) {
        try {
            Match match = videoConferenceService.startMatch(matchId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("match", match);
            response.put("meetingUrl", match.getMeetingUrl());
            response.put("message", "Match started successfully");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Envoyer les invitations SMS aux participants
     * POST /api/videoconference/match/{matchId}/send-invitations
     */
    @PostMapping("/match/{matchId}/send-invitations")
    public ResponseEntity<Map<String, Object>> sendInvitations(@PathVariable Long matchId) {
        try {
            videoConferenceService.sendMeetingInvitations(matchId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Invitations sent successfully");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtenir l'URL de visio d'un match
     * GET /api/videoconference/match/{matchId}/url
     */
    @GetMapping("/match/{matchId}/url")
    public ResponseEntity<Map<String, Object>> getMeetingUrl(@PathVariable Long matchId) {
        try {
            String meetingUrl = videoConferenceService.getMeetingUrl(matchId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("meetingUrl", meetingUrl);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
