package org.example.professional_events.controller;

import org.example.professional_events.entity.CompetitionStream;
import org.example.professional_events.security.JwtUtil;
import org.example.professional_events.service.StreamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/stream")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true", maxAge = 3600)
public class StreamController {

    @Autowired
    private StreamService streamService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * POST /api/stream/competition/{id}
     * Créer ou mettre à jour un stream (FORMATEUR)
     */
    @PostMapping("/competition/{competitionId}")
    public ResponseEntity<?> createStream(
            @PathVariable Long competitionId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");

            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
            String streamUrl = (String) body.get("streamUrl");
            String title = (String) body.get("title");
            Integer autoExpireHours = body.get("autoExpireHours") != null
                    ? Integer.parseInt(body.get("autoExpireHours").toString()) : null;

            if (streamUrl == null || streamUrl.isBlank())
                return ResponseEntity.badRequest().body("streamUrl is required");

            CompetitionStream stream = streamService.createOrUpdateStream(
                    competitionId, streamUrl, title, autoExpireHours, userId);

            return ResponseEntity.ok(buildResponse(stream));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * GET /api/stream/competition/{id}
     * Récupérer le stream d'une compétition
     * - Formateur: accès complet
     * - Apprenant: seulement s'il est inscrit à la compétition
     */
    @GetMapping("/competition/{competitionId}")
    public ResponseEntity<?> getStream(
            @PathVariable Long competitionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            Optional<CompetitionStream> stream = streamService.getStream(competitionId);
            if (stream.isEmpty())
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No stream found");

            // Si token présent, vérifier si participant
            boolean isParticipant = false;
            boolean isFormateur = false;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                Long userId = jwtUtil.extractUserId(authHeader.substring(7));
                String role = jwtUtil.extractRole(authHeader.substring(7));
                isFormateur = "FORMATEUR".equals(role);
                isParticipant = streamService.isParticipant(userId, competitionId);
            }

            Map<String, Object> response = buildResponse(stream.get());
            response.put("canWatch", isFormateur || isParticipant);
            response.put("isParticipant", isParticipant);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * PUT /api/stream/competition/{id}/start
     * Démarrer le stream → LIVE
     */
    @PutMapping("/competition/{competitionId}/start")
    public ResponseEntity<?> startStream(
            @PathVariable Long competitionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");

            CompetitionStream stream = streamService.startStream(competitionId);
            return ResponseEntity.ok(buildResponse(stream));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * PUT /api/stream/competition/{id}/stop
     * Arrêter le stream → OFFLINE
     */
    @PutMapping("/competition/{competitionId}/stop")
    public ResponseEntity<?> stopStream(
            @PathVariable Long competitionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");

            CompetitionStream stream = streamService.stopStream(competitionId);
            return ResponseEntity.ok(buildResponse(stream));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * DELETE /api/stream/competition/{id}
     * Supprimer le stream
     */
    @DeleteMapping("/competition/{competitionId}")
    public ResponseEntity<?> deleteStream(
            @PathVariable Long competitionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing token");

            streamService.deleteStream(competitionId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    private Map<String, Object> buildResponse(CompetitionStream stream) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", stream.getId());
        response.put("competitionId", stream.getCompetitionId());
        response.put("streamUrl", stream.getStreamUrl());
        response.put("embedUrl", streamService.getEmbedUrl(stream.getStreamUrl()));
        response.put("platform", stream.getPlatform());
        response.put("title", stream.getTitle());
        response.put("status", stream.getStatus());
        response.put("startedAt", stream.getStartedAt());
        response.put("stoppedAt", stream.getStoppedAt());
        response.put("autoExpireHours", stream.getAutoExpireHours());
        response.put("isLive", stream.getStatus() == CompetitionStream.StreamStatus.LIVE);
        return response;
    }
}
