package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.ApplicationRequest;
import org.example.b2bmodule.dto.ApplicationResponse;
import org.example.b2bmodule.dto.EmailNotificationDTO;
import org.example.b2bmodule.service.ApplicationService;
import org.example.b2bmodule.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Candidatures avec matching intelligent")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final EmailService emailService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Postuler à une offre (calcul automatique du matchScore)")
    public ApplicationResponse apply(@RequestBody ApplicationRequest req) {
        return applicationService.apply(req);
    }

    @GetMapping
    @Operation(summary = "Lister toutes les candidatures")
    public List<ApplicationResponse> findAll() {
        return applicationService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une candidature par ID")
    public ApplicationResponse findById(@PathVariable Long id) {
        return applicationService.findById(id);
    }

    @GetMapping("/job-offer/{jobOfferId}")
    @Operation(summary = "Candidatures par offre")
    public List<ApplicationResponse> findByJobOffer(@PathVariable Long jobOfferId) {
        return applicationService.findByJobOffer(jobOfferId);
    }

    @GetMapping("/candidate/{candidateId}")
    @Operation(summary = "Candidatures par candidat")
    public List<ApplicationResponse> findByCandidate(@PathVariable Long candidateId) {
        return applicationService.findByCandidate(candidateId);
    }

    @GetMapping("/job-offer/{jobOfferId}/top")
    @Operation(summary = "Top candidats par matchScore")
    public List<ApplicationResponse> findTopMatches(@PathVariable Long jobOfferId) {
        return applicationService.findTopMatches(jobOfferId);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Changer le statut")
    public ApplicationResponse updateStatus(@PathVariable Long id, @RequestParam String status) {
        return applicationService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprimer")
    public void delete(@PathVariable Long id) {
        applicationService.delete(id);
    }

    @PostMapping("/notify")
    @Operation(summary = "Envoyer un email de notification au candidat")
    public ResponseEntity<String> sendNotification(@RequestBody EmailNotificationDTO dto) {
        try {
            emailService.sendApplicationNotification(dto);
            return ResponseEntity.ok("Email sent successfully to " + dto.getCandidateEmail());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send email: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status-notify")
    @Operation(summary = "Changer le statut ET envoyer un email")
    public ResponseEntity<?> updateStatusAndNotify(
            @PathVariable Long id, 
            @RequestParam String status,
            @RequestBody EmailNotificationDTO dto) {
        try {
            ApplicationResponse response = applicationService.updateStatus(id, status);
            emailService.sendApplicationNotification(dto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update status and send email: " + e.getMessage());
        }
    }
}



