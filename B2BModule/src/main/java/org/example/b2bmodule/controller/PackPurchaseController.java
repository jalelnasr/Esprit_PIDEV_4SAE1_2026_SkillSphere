package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.PackPurchaseService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/purchases")
@RequiredArgsConstructor
@Tag(name = "Pack Purchases", description = "Achats de packs")
public class PackPurchaseController {

    private final PackPurchaseService purchaseService;

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Acheter un pack")
    public PackPurchaseResponse create(@RequestBody PackPurchaseRequest req) { return purchaseService.create(req); }

    @GetMapping @Operation(summary = "Lister tous les achats")
    public List<PackPurchaseResponse> findAll() { return purchaseService.findAll(); }

    @GetMapping("/{id}") @Operation(summary = "Obtenir un achat par ID")
    public PackPurchaseResponse findById(@PathVariable Long id) { return purchaseService.findById(id); }

    @GetMapping("/company/{companyId}") @Operation(summary = "Achats par entreprise")
    public List<PackPurchaseResponse> findByCompany(@PathVariable Long companyId) { return purchaseService.findByCompany(companyId); }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Supprimer un achat")
    public void delete(@PathVariable Long id) { purchaseService.delete(id); }
}

