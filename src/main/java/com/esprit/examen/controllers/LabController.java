package com.esprit.examen.controllers;

import com.esprit.examen.entities.Lab;
import com.esprit.examen.services.LabService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/labs")
@Tag(name = "Lab", description = "Lab management APIs")
public class LabController {

    @Autowired
    private LabService labService;

    @PostMapping("/{categoryId}")
    @Operation(summary = "Create a new lab in a category")
    public ResponseEntity<Lab> createLab(@RequestBody Lab lab, @PathVariable Long categoryId) {
        return ResponseEntity.ok(labService.createLab(lab, categoryId));
    }

    @GetMapping
    @Operation(summary = "Get all labs")
    public ResponseEntity<List<Lab>> getAllLabs() {
        return ResponseEntity.ok(labService.getAllLabs());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a lab by ID")
    public ResponseEntity<Lab> getLabById(@PathVariable Long id) {
        return ResponseEntity.ok(labService.getLabById(id));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get labs by category ID")
    public ResponseEntity<List<Lab>> getLabsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(labService.getLabsByCategory(categoryId));
    }

    @GetMapping("/difficulty/{difficulty}")
    @Operation(summary = "Get labs by difficulty level")
    public ResponseEntity<List<Lab>> getLabsByDifficulty(@PathVariable String difficulty) {
        return ResponseEntity.ok(labService.getLabsByDifficulty(difficulty));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active labs")
    public ResponseEntity<List<Lab>> getActiveLabs() {
        return ResponseEntity.ok(labService.getActiveLabs());
    }

    @GetMapping("/level/{level}")
    @Operation(summary = "Get labs accessible for a given user level")
    public ResponseEntity<List<Lab>> getLabsForUserLevel(@PathVariable Integer level) {
        return ResponseEntity.ok(labService.getLabsForUserLevel(level));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a lab by ID")
    public ResponseEntity<Lab> updateLab(@PathVariable Long id, @RequestBody Lab lab) {
        return ResponseEntity.ok(labService.updateLab(id, lab));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a lab by ID")
    public ResponseEntity<Void> deleteLab(@PathVariable Long id) {
        labService.deleteLab(id);
        return ResponseEntity.ok().build();
    }
}