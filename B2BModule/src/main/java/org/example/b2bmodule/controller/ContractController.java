package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.ContractService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/contracts")
@RequiredArgsConstructor
@Tag(name = "Contracts", description = "Gestion des contrats")
public class ContractController {

    private final ContractService contractService;

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Créer un contrat")
    public ContractResponse create(@RequestBody ContractRequest req) { return contractService.create(req); }

    @GetMapping @Operation(summary = "Lister tous les contrats")
    public List<ContractResponse> findAll() { return contractService.findAll(); }

    @GetMapping("/{id}") @Operation(summary = "Obtenir un contrat par ID")
    public ContractResponse findById(@PathVariable Long id) { return contractService.findById(id); }

    @GetMapping("/company/{companyId}") @Operation(summary = "Contrats par entreprise")
    public List<ContractResponse> findByCompany(@PathVariable Long companyId) { return contractService.findByCompany(companyId); }

    @GetMapping("/candidate/{candidateId}") @Operation(summary = "Contrats par candidat")
    public List<ContractResponse> findByCandidate(@PathVariable Long candidateId) { return contractService.findByCandidate(candidateId); }

    @PutMapping("/{id}/sign") @Operation(summary = "Signer un contrat")
    public ContractResponse sign(@PathVariable Long id) { return contractService.sign(id); }

    @PutMapping("/{id}/status") @Operation(summary = "Changer le statut")
    public ContractResponse updateStatus(@PathVariable Long id, @RequestParam String status) { return contractService.updateStatus(id, status); }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Supprimer")
    public void delete(@PathVariable Long id) { contractService.delete(id); }
}

