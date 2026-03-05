package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.JobOfferService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/job-offers")
@RequiredArgsConstructor
@Tag(name = "Job Offers", description = "Offres d'emploi")
public class JobOfferController {

    private final JobOfferService jobOfferService;

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Créer une offre")
    public JobOfferResponse create(@RequestBody JobOfferRequest req) { return jobOfferService.create(req); }

    @GetMapping @Operation(summary = "Lister toutes les offres")
    public List<JobOfferResponse> findAll() { return jobOfferService.findAll(); }

    @GetMapping("/open") @Operation(summary = "Offres ouvertes")
    public List<JobOfferResponse> findOpen() { return jobOfferService.findOpen(); }

    @GetMapping("/{id}") @Operation(summary = "Obtenir une offre par ID")
    public JobOfferResponse findById(@PathVariable Long id) { return jobOfferService.findById(id); }

    @GetMapping("/company/{companyId}") @Operation(summary = "Offres par entreprise")
    public List<JobOfferResponse> findByCompany(@PathVariable Long companyId) { return jobOfferService.findByCompany(companyId); }

    @GetMapping("/search") @Operation(summary = "Chercher par compétence")
    public List<JobOfferResponse> searchBySkill(@RequestParam String skill) { return jobOfferService.searchBySkill(skill); }

    @PutMapping("/{id}") @Operation(summary = "Modifier une offre")
    public JobOfferResponse update(@PathVariable Long id, @RequestBody JobOfferRequest req) { return jobOfferService.update(id, req); }

    @PutMapping("/{id}/status") @Operation(summary = "Changer le statut")
    public JobOfferResponse updateStatus(@PathVariable Long id, @RequestParam String status) { return jobOfferService.updateStatus(id, status); }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Supprimer une offre")
    public void delete(@PathVariable Long id) { jobOfferService.delete(id); }
}

