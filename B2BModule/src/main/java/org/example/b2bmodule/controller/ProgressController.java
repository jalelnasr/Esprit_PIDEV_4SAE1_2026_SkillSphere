package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.ProgressService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/b2b/progress")
@RequiredArgsConstructor
@Tag(name = "Progress", description = "Suivi de progression")
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/assignment/{assignmentId}") @Operation(summary = "Progression par assignation")
    public ProgressResponse findByAssignment(@PathVariable Long assignmentId) { return progressService.findByAssignment(assignmentId); }

    @PutMapping("/assignment/{assignmentId}") @Operation(summary = "Mettre à jour la progression")
    public ProgressResponse update(@PathVariable Long assignmentId, @RequestBody ProgressRequest req) { return progressService.updateProgress(assignmentId, req); }

    @GetMapping("/company/{companyId}/average") @Operation(summary = "Progression moyenne par entreprise")
    public Double averageByCompany(@PathVariable Long companyId) { return progressService.averageByCompany(companyId); }
}

