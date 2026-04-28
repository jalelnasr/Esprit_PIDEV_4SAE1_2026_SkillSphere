package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.AssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/assignments")
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Assignation de formations")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Assigner une formation")
    public AssignmentResponse create(@RequestBody AssignmentRequest req) { return assignmentService.create(req); }

    @GetMapping @Operation(summary = "Lister toutes les assignations")
    public List<AssignmentResponse> findAll() { return assignmentService.findAll(); }

    @GetMapping("/{id}") @Operation(summary = "Obtenir une assignation par ID")
    public AssignmentResponse findById(@PathVariable Long id) { return assignmentService.findById(id); }

    @GetMapping("/company/{companyId}") @Operation(summary = "Assignations par entreprise")
    public List<AssignmentResponse> findByCompany(@PathVariable Long companyId) { return assignmentService.findByCompany(companyId); }

    @GetMapping("/employee/{employeeId}") @Operation(summary = "Assignations par employé")
    public List<AssignmentResponse> findByEmployee(@PathVariable Long employeeId) { return assignmentService.findByEmployee(employeeId); }

    @PutMapping("/{id}/status") @Operation(summary = "Changer le statut")
    public AssignmentResponse updateStatus(@PathVariable Long id, @RequestParam String status) { return assignmentService.updateStatus(id, status); }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Supprimer une assignation")
    public void delete(@PathVariable Long id) { assignmentService.delete(id); }
}

