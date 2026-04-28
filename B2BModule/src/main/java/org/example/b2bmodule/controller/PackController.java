package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.PackService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/packs")
@RequiredArgsConstructor
@Tag(name = "Packs", description = "Gestion des packs de formations")
public class PackController {

    private final PackService packService;

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Créer un pack")
    public PackResponse create(@RequestBody PackRequest req) { return packService.create(req); }

    @GetMapping @Operation(summary = "Lister tous les packs")
    public List<PackResponse> findAll() { return packService.findAll(); }

    @GetMapping("/active") @Operation(summary = "Packs actifs")
    public List<PackResponse> findActive() { return packService.findActive(); }

    @GetMapping("/{id}") @Operation(summary = "Obtenir un pack par ID")
    public PackResponse findById(@PathVariable Long id) { return packService.findById(id); }

    @PutMapping("/{id}") @Operation(summary = "Modifier un pack")
    public PackResponse update(@PathVariable Long id, @RequestBody PackRequest req) { return packService.update(id, req); }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Supprimer un pack")
    public void delete(@PathVariable Long id) { packService.delete(id); }
}

