package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.CompanyService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/companies")
@RequiredArgsConstructor
@Tag(name = "Companies", description = "Gestion des entreprises")
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer une entreprise")
    public CompanyResponse create(@RequestBody CompanyRequest req) { return companyService.create(req); }

    @GetMapping
    @Operation(summary = "Lister toutes les entreprises")
    public List<CompanyResponse> findAll() { return companyService.findAll(); }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une entreprise par ID")
    public CompanyResponse findById(@PathVariable Long id) { return companyService.findById(id); }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une entreprise")
    public CompanyResponse update(@PathVariable Long id, @RequestBody CompanyRequest req) { return companyService.update(id, req); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprimer une entreprise")
    public void delete(@PathVariable Long id) { companyService.delete(id); }

    @GetMapping("/sector/{sector}")
    @Operation(summary = "Chercher par secteur")
    public List<CompanyResponse> findBySector(@PathVariable String sector) { return companyService.findBySector(sector); }
}

