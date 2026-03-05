package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.MissionService;
import org.example.b2bmodule.service.MissionApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/missions")
@RequiredArgsConstructor
@Tag(name = "Missions", description = "Missions freelance")
public class MissionController {

    private final MissionService missionService;
    private final MissionApplicationService missionAppService;

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Créer une mission")
    public MissionResponse create(@RequestBody MissionRequest req) { return missionService.create(req); }

    @GetMapping @Operation(summary = "Lister toutes les missions")
    public List<MissionResponse> findAll() { return missionService.findAll(); }

    @GetMapping("/open") @Operation(summary = "Missions ouvertes")
    public List<MissionResponse> findOpen() { return missionService.findOpen(); }

    @GetMapping("/{id}") @Operation(summary = "Obtenir une mission par ID")
    public MissionResponse findById(@PathVariable Long id) { return missionService.findById(id); }

    @GetMapping("/company/{companyId}") @Operation(summary = "Missions par entreprise")
    public List<MissionResponse> findByCompany(@PathVariable Long companyId) { return missionService.findByCompany(companyId); }

    @PutMapping("/{id}") @Operation(summary = "Modifier une mission")
    public MissionResponse update(@PathVariable Long id, @RequestBody MissionRequest req) { return missionService.update(id, req); }

    @PutMapping("/{id}/status") @Operation(summary = "Changer le statut")
    public MissionResponse updateStatus(@PathVariable Long id, @RequestParam String status) { return missionService.updateStatus(id, status); }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Supprimer")
    public void delete(@PathVariable Long id) { missionService.delete(id); }

    // --- Mission Applications ---
    @PostMapping("/apply") @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Postuler à une mission")
    public MissionApplicationResponse apply(@RequestBody MissionApplicationRequest req) { return missionAppService.apply(req); }

    @GetMapping("/{missionId}/applications") @Operation(summary = "Candidatures à une mission")
    public List<MissionApplicationResponse> findAppsByMission(@PathVariable Long missionId) { return missionAppService.findByMission(missionId); }

    @PutMapping("/applications/{id}/status") @Operation(summary = "Changer statut candidature mission")
    public MissionApplicationResponse updateAppStatus(@PathVariable Long id, @RequestParam String status) { return missionAppService.updateStatus(id, status); }
}

