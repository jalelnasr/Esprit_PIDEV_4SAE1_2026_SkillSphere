package org.example.professional_events.controller;

import org.example.professional_events.entity.Competition;
import org.example.professional_events.entity.Participant;
import org.example.professional_events.security.JwtUtil;
import org.example.professional_events.service.CompetitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/competitions")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true", maxAge = 3600)
public class CompetitionController {

    @Autowired
    private CompetitionService competitionService;

    @Autowired
    private JwtUtil jwtUtil;

    // ===================== CREATE =====================
    @PostMapping
    public ResponseEntity<?> createCompetition(
            @RequestBody Competition competition,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }

            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            competition.setCreatedBy(userId);

            Competition createdCompetition = competitionService.createCompetition(competition);
            return new ResponseEntity<>(createdCompetition, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error creating competition: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===================== READ =====================
    @GetMapping
    public ResponseEntity<List<Competition>> getAllCompetitions() {
        try {
            List<Competition> competitions = competitionService.getAllCompetitions();
            return new ResponseEntity<>(competitions, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace(); // Log l'erreur dans la console
            System.err.println("❌ Erreur getAllCompetitions: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{competitionId}")
    public ResponseEntity<Competition> getCompetitionById(@PathVariable Long competitionId) {
        try {
            Optional<Competition> competition = competitionService.getCompetitionById(competitionId);
            return competition.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(null, HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/status/open")
    public ResponseEntity<List<Competition>> getOpenCompetitions() {
        try {
            return new ResponseEntity<>(competitionService.getOpenCompetitions(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/status/closed")
    public ResponseEntity<List<Competition>> getClosedCompetitions() {
        try {
            return new ResponseEntity<>(competitionService.getClosedCompetitions(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ UPDATE FULL (FIX FOR MANAGE) =====================
    // ✅ nécessaire car ton Angular appelle PUT /competitions/{id}
    @PutMapping("/{competitionId}")
    public ResponseEntity<?> updateCompetition(
            @PathVariable Long competitionId,
            @RequestBody Competition updated,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }

            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            Optional<Competition> opt = competitionService.getCompetitionById(competitionId);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Competition not found");
            }

            Competition existing = opt.get();

            // ✅ sécurité: seul le créateur peut modifier
            if (existing.getCreatedBy() == null || !existing.getCreatedBy().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not the owner of this competition");
            }

            // ✅ mettre à jour champs (avec valeurs par défaut si null)
            existing.setTitle(updated.getTitle());
            existing.setDescription(updated.getDescription());
            existing.setType(updated.getType() != null ? updated.getType() : existing.getType());
            existing.setParticipationType(updated.getParticipationType() != null ? updated.getParticipationType() : existing.getParticipationType());
            existing.setStartDate(updated.getStartDate());
            existing.setEndDate(updated.getEndDate());
            existing.setMaxParticipants(updated.getMaxParticipants());
            existing.setStatus(updated.getStatus());
            
            // ✅ Champs optionnels (peuvent être null)
            if (updated.getNumberOfTeams() != null) existing.setNumberOfTeams(updated.getNumberOfTeams());
            if (updated.getParticipantsPerTeam() != null) existing.setParticipantsPerTeam(updated.getParticipantsPerTeam());
            if (updated.getMinTeamSize() != null) existing.setMinTeamSize(updated.getMinTeamSize());
            if (updated.getMaxTeamSize() != null) existing.setMaxTeamSize(updated.getMaxTeamSize());

            Competition saved = competitionService.save(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error updating competition: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===================== UPDATE STATUS =====================
    @PutMapping("/{competitionId}/status")
    public ResponseEntity<?> updateCompetitionStatus(
            @PathVariable Long competitionId,
            @RequestParam String status,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            Competition.CompetitionStatus statusEnum = Competition.CompetitionStatus.valueOf(status);
            Competition competition = competitionService.updateCompetitionStatus(competitionId, statusEnum);
            return new ResponseEntity<>(competition, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Invalid status value: " + status, HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Competition not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===================== PARTICIPATION (JWT) =====================
    @PostMapping("/{competitionId}/register")
    public ResponseEntity<?> registerParticipant(
            @PathVariable Long competitionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            Participant participant = competitionService.registerParticipant(userId, competitionId);
            return new ResponseEntity<>(participant, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{competitionId}/register")
    public ResponseEntity<?> cancelRegistration(
            @PathVariable Long competitionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            competitionService.cancelRegistration(userId, competitionId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{competitionId}/participants")
    public ResponseEntity<List<Participant>> getCompetitionParticipants(@PathVariable Long competitionId) {
        try {
            return new ResponseEntity<>(competitionService.getCompetitionParticipants(competitionId), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ endpoint utilisé par "My Participations"
    @GetMapping("/my-participations")
    public ResponseEntity<?> getMyParticipations(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            List<Competition> competitions = competitionService.getMyParticipations(userId);
            return new ResponseEntity<>(competitions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ endpoint pour vérifier si l'utilisateur est inscrit à une compétition
    @GetMapping("/{competitionId}/my-registration")
    public ResponseEntity<?> getMyRegistration(
            @PathVariable Long competitionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            Optional<Participant> participant = competitionService.getMyRegistration(userId, competitionId);
            if (participant.isPresent()) {
                return new ResponseEntity<>(participant.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ endpoint pour les compétitions créées par le formateur
    @GetMapping("/my-created")
    public ResponseEntity<?> getMyCreatedCompetitions(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            List<Competition> competitions = competitionService.getCompetitionsByCreator(userId);
            return new ResponseEntity<>(competitions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===================== SCORE =====================
    @PutMapping("/participant/{registrationId}/score")
    public ResponseEntity<?> updateParticipantScore(
            @PathVariable Long registrationId,
            @RequestParam Integer score,
            @RequestParam Integer rank
    ) {
        try {
            Participant participant = competitionService.updateParticipantScore(registrationId, score, rank);
            return new ResponseEntity<>(participant, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===================== DELETE =====================
    @DeleteMapping("/{competitionId}")
    public ResponseEntity<Void> deleteCompetition(@PathVariable Long competitionId) {
        try {
            competitionService.deleteCompetition(competitionId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===================== LOCATIONS (MAP) =====================
    @GetMapping("/locations")
    public ResponseEntity<?> getAllLocations() {
        try {
            List<Competition> competitions = competitionService.getAllCompetitions();
            List<Map<String, Object>> locations = competitions.stream()
                .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
                .map(c -> {
                    Map<String, Object> loc = new java.util.HashMap<>();
                    loc.put("competitionId", c.getCompetitionId());
                    loc.put("title", c.getTitle());
                    loc.put("locationName", c.getLocationName());
                    loc.put("locationAddress", c.getLocationAddress());
                    loc.put("latitude", c.getLatitude());
                    loc.put("longitude", c.getLongitude());
                    loc.put("status", c.getStatus());
                    loc.put("type", c.getType());
                    loc.put("startDate", c.getStartDate());
                    return loc;
                })
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }


    /**
     * Obtenir les membres de l'équipe gagnante d'une compétition
     * GET /api/competitions/{competitionId}/winner-team-members
     */
    @GetMapping("/{competitionId}/winner-team-members")
    public ResponseEntity<?> getWinnerTeamMembers(@PathVariable Long competitionId) {
        try {
            Optional<Competition> competitionOpt = competitionService.getCompetitionById(competitionId);
            if (competitionOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Competition not found");
            }

            Competition competition = competitionOpt.get();
            if (competition.getWinnerTeamId() == null) {
                return ResponseEntity.ok(java.util.Collections.emptyList());
            }

            List<Map<String, Object>> members = competitionService.getWinnerTeamMembersWithContacts(competition.getWinnerTeamId());
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

}