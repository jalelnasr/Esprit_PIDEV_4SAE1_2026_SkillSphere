package com.esprit.examen.controllers;

import com.esprit.examen.entities.LabInstance;
import com.esprit.examen.services.LabInstanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-instances")
@Tag(name = "Lab Instance", description = "Lab instance management APIs")
public class LabInstanceController {

    @Autowired
    private LabInstanceService labInstanceService;

    @PostMapping("/{userId}/{labId}")
    @Operation(summary = "Create a new lab instance for a user and lab")
    public ResponseEntity<LabInstance> createLabInstance(@RequestBody LabInstance instance, @PathVariable Long userId, @PathVariable Long labId) {
        return ResponseEntity.ok(labInstanceService.createLabInstance(instance, userId, labId));
    }

    @GetMapping
    @Operation(summary = "Get all lab instances")
    public ResponseEntity<List<LabInstance>> getAllLabInstances() {
        return ResponseEntity.ok(labInstanceService.getAllLabInstances());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a lab instance by ID")
    public ResponseEntity<LabInstance> getLabInstanceById(@PathVariable Long id) {
        return ResponseEntity.ok(labInstanceService.getLabInstanceById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get lab instances by user ID")
    public ResponseEntity<List<LabInstance>> getLabInstancesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(labInstanceService.getLabInstancesByUser(userId));
    }

    @GetMapping("/lab/{labId}")
    @Operation(summary = "Get lab instances by lab ID")
    public ResponseEntity<List<LabInstance>> getLabInstancesByLab(@PathVariable Long labId) {
        return ResponseEntity.ok(labInstanceService.getLabInstancesByLab(labId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get lab instances by status")
    public ResponseEntity<List<LabInstance>> getLabInstancesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(labInstanceService.getLabInstancesByStatus(status));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a lab instance by ID")
    public ResponseEntity<LabInstance> updateLabInstance(@PathVariable Long id, @RequestBody LabInstance instance) {
        return ResponseEntity.ok(labInstanceService.updateLabInstance(id, instance));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a lab instance by ID")
    public ResponseEntity<Void> deleteLabInstance(@PathVariable Long id) {
        labInstanceService.deleteLabInstance(id);
        return ResponseEntity.ok().build();
    }
}