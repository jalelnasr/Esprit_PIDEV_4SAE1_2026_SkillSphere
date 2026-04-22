package org.example.professional_events.controller;

import org.example.professional_events.entity.Session;
import org.example.professional_events.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/sessions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SessionController {

    @Autowired
    private SessionRepository sessionRepository;

    @PostMapping
    public ResponseEntity<Session> createSession(@RequestBody Session session) {
        try {
            Session created = sessionRepository.save(session);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Session>> getAllSessions() {
        try {
            List<Session> sessions = sessionRepository.findAll();
            return new ResponseEntity<>(sessions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<Session> getSessionById(@PathVariable Long sessionId) {
        try {
            Optional<Session> session = sessionRepository.findById(sessionId);
            if (session.isPresent()) {
                return new ResponseEntity<>(session.get(), HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/competition/{competitionId}")
    public ResponseEntity<List<Session>> getSessionsByCompetition(@PathVariable Long competitionId) {
        try {
            List<Session> sessions = sessionRepository.findByCompetitionId(competitionId);
            return new ResponseEntity<>(sessions, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{sessionId}")
    public ResponseEntity<Session> updateSession(@PathVariable Long sessionId, @RequestBody Session session) {
        try {
            Optional<Session> existing = sessionRepository.findById(sessionId);
            if (existing.isPresent()) {
                session.setSessionId(sessionId);
                Session updated = sessionRepository.save(session);
                return new ResponseEntity<>(updated, HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long sessionId) {
        try {
            sessionRepository.deleteById(sessionId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

