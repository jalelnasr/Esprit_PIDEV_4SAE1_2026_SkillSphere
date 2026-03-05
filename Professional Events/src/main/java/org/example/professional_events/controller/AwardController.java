package org.example.professional_events.controller;

import org.example.professional_events.entity.Award;
import org.example.professional_events.repository.AwardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/awards")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AwardController {

    @Autowired
    private AwardRepository awardRepository;

    @PostMapping
    public ResponseEntity<Award> createAward(@RequestBody Award award) {
        try {
            Award created = awardRepository.save(award);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Award>> getAllAwards() {
        try {
            List<Award> awards = awardRepository.findAll();
            return new ResponseEntity<>(awards, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{awardId}")
    public ResponseEntity<Award> getAwardById(@PathVariable Long awardId) {
        try {
            Optional<Award> award = awardRepository.findById(awardId);
            if (award.isPresent()) {
                return new ResponseEntity<>(award.get(), HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Award>> getAwardsByUser(@PathVariable Long userId) {
        try {
            List<Award> awards = awardRepository.findByUserId(userId);
            return new ResponseEntity<>(awards, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/competition/{competitionId}")
    public ResponseEntity<List<Award>> getAwardsByCompetition(@PathVariable Long competitionId) {
        try {
            List<Award> awards = awardRepository.findByCompetitionId(competitionId);
            return new ResponseEntity<>(awards, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Award>> getAwardsByType(@PathVariable Award.AwardType type) {
        try {
            List<Award> awards = awardRepository.findByType(type);
            return new ResponseEntity<>(awards, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{awardId}")
    public ResponseEntity<Award> updateAward(@PathVariable Long awardId, @RequestBody Award award) {
        try {
            Optional<Award> existing = awardRepository.findById(awardId);
            if (existing.isPresent()) {
                award.setAwardId(awardId);
                Award updated = awardRepository.save(award);
                return new ResponseEntity<>(updated, HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{awardId}")
    public ResponseEntity<Void> deleteAward(@PathVariable Long awardId) {
        try {
            awardRepository.deleteById(awardId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

