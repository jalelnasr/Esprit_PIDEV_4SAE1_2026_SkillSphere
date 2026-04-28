package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.CandidateService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/candidates")
@RequiredArgsConstructor
@Tag(name = "Candidates", description = "Gestion des candidats")
public class CandidateController {

    private final CandidateService candidateService;

    @PostMapping 
    @ResponseStatus(HttpStatus.CREATED) 
    @Operation(summary = "Créer un profil candidat")
    @PreAuthorize("hasAnyRole('ADMIN', 'APPRENANT')")
    public CandidateResponse create(@RequestBody CandidateRequest req) { 
        return candidateService.create(req); 
    }

    @GetMapping 
    @Operation(summary = "Lister tous les candidats")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
    public List<CandidateResponse> findAll() { 
        return candidateService.findAll(); 
    }

    @GetMapping("/active") 
    @Operation(summary = "Candidats en recherche")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
    public List<CandidateResponse> findActive() { 
        return candidateService.findActive(); 
    }

    @GetMapping("/{id}") 
    @Operation(summary = "Obtenir un candidat par ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE', 'APPRENANT')")
    public CandidateResponse findById(@PathVariable Long id) { 
        return candidateService.findById(id); 
    }

    @GetMapping("/search") 
    @Operation(summary = "Chercher par compétence")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
    public List<CandidateResponse> findBySkill(@RequestParam String skill) { 
        return candidateService.findBySkill(skill); 
    }

    @PutMapping("/{id}") 
    @Operation(summary = "Modifier un candidat")
    @PreAuthorize("hasAnyRole('ADMIN', 'APPRENANT')")
    public CandidateResponse update(@PathVariable Long id, @RequestBody CandidateRequest req) { 
        return candidateService.update(id, req); 
    }

    @DeleteMapping("/{id}") 
    @ResponseStatus(HttpStatus.NO_CONTENT) 
    @Operation(summary = "Supprimer un candidat")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) { 
        candidateService.delete(id); 
    }
}
