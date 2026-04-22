package org.example.professional_events.controller;

import org.example.professional_events.entity.Jury;
import org.example.professional_events.repository.JuryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/jury")
@CrossOrigin(origins = "*", maxAge = 3600)
public class JuryController {

    @Autowired
    private JuryRepository juryRepository;

    @PostMapping
    public ResponseEntity<Jury> createJury(@RequestBody Jury jury) {
        try {
            Jury created = juryRepository.save(jury);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Jury>> getAllJury() {
        try {
            List<Jury> juryList = juryRepository.findAll();
            return new ResponseEntity<>(juryList, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{juryId}")
    public ResponseEntity<Jury> getJuryById(@PathVariable Long juryId) {
        try {
            Optional<Jury> jury = juryRepository.findById(juryId);
            if (jury.isPresent()) {
                return new ResponseEntity<>(jury.get(), HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/expertise/{expertise}")
    public ResponseEntity<List<Jury>> getJuryByExpertise(@PathVariable String expertise) {
        try {
            List<Jury> juryList = juryRepository.findByExpertise(expertise);
            return new ResponseEntity<>(juryList, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{juryId}")
    public ResponseEntity<Jury> updateJury(@PathVariable Long juryId, @RequestBody Jury jury) {
        try {
            Optional<Jury> existing = juryRepository.findById(juryId);
            if (existing.isPresent()) {
                jury.setJuryId(juryId);
                Jury updated = juryRepository.save(jury);
                return new ResponseEntity<>(updated, HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{juryId}")
    public ResponseEntity<Void> deleteJury(@PathVariable Long juryId) {
        try {
            juryRepository.deleteById(juryId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

