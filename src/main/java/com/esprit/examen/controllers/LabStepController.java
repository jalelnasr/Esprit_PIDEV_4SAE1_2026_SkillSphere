package com.esprit.examen.controllers;

import com.esprit.examen.entities.LabStep;
import com.esprit.examen.services.LabStepService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-steps")
@Tag(name = "Lab Step", description = "Lab step management APIs")
public class LabStepController {

    @Autowired
    private LabStepService labStepService;

    @PostMapping("/{labId}")
    @Operation(summary = "Create a new lab step for a lab")
    public ResponseEntity<LabStep> createLabStep(@RequestBody LabStep step, @PathVariable Long labId) {
        return ResponseEntity.ok(labStepService.createLabStep(step, labId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a lab step by ID")
    public ResponseEntity<LabStep> getLabStepById(@PathVariable Long id) {
        return ResponseEntity.ok(labStepService.getLabStepById(id));
    }

    @GetMapping("/lab/{labId}")
    @Operation(summary = "Get all steps for a lab ordered by step number")
    public ResponseEntity<List<LabStep>> getStepsByLab(@PathVariable Long labId) {
        return ResponseEntity.ok(labStepService.getStepsByLab(labId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a lab step by ID")
    public ResponseEntity<LabStep> updateLabStep(@PathVariable Long id, @RequestBody LabStep step) {
        return ResponseEntity.ok(labStepService.updateLabStep(id, step));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a lab step by ID")
    public ResponseEntity<Void> deleteLabStep(@PathVariable Long id) {
        labStepService.deleteLabStep(id);
        return ResponseEntity.ok().build();
    }
}