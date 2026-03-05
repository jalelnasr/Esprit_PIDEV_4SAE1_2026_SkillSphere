package org.example.professional_events.controller;

import org.example.professional_events.entity.Participant;
import org.example.professional_events.repository.ParticipantRepository;
import org.example.professional_events.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/participants")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ParticipantController {

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ Register (JWT -> userId)
    @PostMapping("/register/{competitionId}")
    public ResponseEntity<Participant> register(
            @PathVariable Long competitionId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.extractUserId(token);

            Optional<Participant> existing = participantRepository.findByUserIdAndCompetitionId(userId, competitionId);
            if (existing.isPresent()) {
                return new ResponseEntity<>(existing.get(), HttpStatus.OK);
            }

            Participant p = new Participant();
            p.setUserId(userId);
            p.setCompetitionId(competitionId);
            p.setRegistrationDate(LocalDateTime.now());
            p.setStatus(Participant.ParticipantStatus.REGISTERED);
            p.setScore(0);
            p.setRank(null);

            Participant created = participantRepository.save(p);
            return new ResponseEntity<>(created, HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ Cancel (JWT -> userId)
    @DeleteMapping("/cancel/{competitionId}")
    public ResponseEntity<Void> cancel(
            @PathVariable Long competitionId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.extractUserId(token);

            Optional<Participant> existing = participantRepository.findByUserIdAndCompetitionId(userId, competitionId);
            if (existing.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            participantRepository.delete(existing.get());
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);

        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // CRUD (si tu veux garder)
    @GetMapping("/competition/{competitionId}")
    public ResponseEntity<List<Participant>> getParticipantsByCompetition(@PathVariable Long competitionId) {
        try {
            return new ResponseEntity<>(participantRepository.findByCompetitionId(competitionId), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Participant>> getParticipantsByUser(@PathVariable Long userId) {
        try {
            return new ResponseEntity<>(participantRepository.findByUserId(userId), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{registrationId}/score")
    public ResponseEntity<Participant> updateParticipantScore(
            @PathVariable Long registrationId,
            @RequestParam Integer score,
            @RequestParam Integer rank
    ) {
        try {
            Optional<Participant> existing = participantRepository.findById(registrationId);
            if (existing.isPresent()) {
                Participant participant = existing.get();
                participant.setScore(score);
                participant.setRank(rank);
                return new ResponseEntity<>(participantRepository.save(participant), HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}