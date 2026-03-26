package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.service.SessionMeetService;
import org.example.formation_service.web.dto.CalendarEventResponse;
import org.example.formation_service.web.dto.MeetRequest;
import org.example.formation_service.web.dto.MeetResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SessionMeetController {

    private final SessionMeetService meetService;

    // ── FORMATEUR: Create meet for a session ──────────────────────────────────
    @PostMapping("/sessions/{sessionId}/meets")
    public ResponseEntity<MeetResponse> createMeet(
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") Long formateurId,
            @RequestBody MeetRequest request) {
        return ResponseEntity.ok(meetService.createMeet(sessionId, formateurId, request));
    }

    // ── ALL: List meets for a session ─────────────────────────────────────────
    @GetMapping("/sessions/{sessionId}/meets")
    public ResponseEntity<List<MeetResponse>> getMeetsBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(meetService.getMeetsBySession(sessionId));
    }

    // ── FORMATEUR: Update meet status (LIVE / ENDED / CANCELLED) ─────────────
    @PutMapping("/meets/{meetId}/status")
    public ResponseEntity<MeetResponse> updateStatus(
            @PathVariable Long meetId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(meetService.updateStatus(meetId, body.get("status")));
    }

    // ── FORMATEUR: Delete meet ────────────────────────────────────────────────
    @DeleteMapping("/meets/{meetId}")
    public ResponseEntity<Void> deleteMeet(@PathVariable Long meetId) {
        meetService.deleteMeet(meetId);
        return ResponseEntity.noContent().build();
    }

    // ── APPRENANT: Record join ────────────────────────────────────────────────
    @PostMapping("/meets/{meetId}/join")
    public ResponseEntity<Void> recordJoin(
            @PathVariable Long meetId,
            @RequestHeader("X-User-Id") Long userId) {
        meetService.recordJoin(meetId, userId);
        return ResponseEntity.ok().build();
    }

    // ── CALENDAR: Get events for a month ─────────────────────────────────────
    // ?month=2026-03&role=FORMATEUR or APPRENANT
    @GetMapping("/meets/calendar")
    public ResponseEntity<List<CalendarEventResponse>> getCalendar(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role,
            @RequestParam String month) {
        if ("FORMATEUR".equals(role) || "ADMIN".equals(role)) {
            return ResponseEntity.ok(meetService.getCalendarForFormateur(userId, month));
        } else {
            return ResponseEntity.ok(meetService.getCalendarForApprenant(userId, month));
        }
    }

    // ── SIDEBAR: Upcoming meets ───────────────────────────────────────────────
    @GetMapping("/meets/upcoming")
    public ResponseEntity<List<MeetResponse>> getUpcoming(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        if ("FORMATEUR".equals(role) || "ADMIN".equals(role)) {
            return ResponseEntity.ok(meetService.getUpcomingMeetsForFormateur(userId));
        } else {
            return ResponseEntity.ok(meetService.getUpcomingMeetsForApprenant(userId));
        }
    }

    // ── SIDEBAR: Today's meets ────────────────────────────────────────────────
    @GetMapping("/meets/today")
    public ResponseEntity<List<MeetResponse>> getTodayMeets(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        if ("FORMATEUR".equals(role) || "ADMIN".equals(role)) {
            return ResponseEntity.ok(meetService.getTodayMeetsForFormateur(userId));
        } else {
            return ResponseEntity.ok(meetService.getTodayMeetsForApprenant(userId));
        }
    }
}
