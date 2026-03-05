package com.example.platformevaluationservice.evalution.controller;

import com.example.platformevaluationservice.evalution.dto.CreateCertificate;
import com.example.platformevaluationservice.evalution.dto.UpdateCertificate;
import com.example.platformevaluationservice.evalution.model.Certificate;
import com.example.platformevaluationservice.evalution.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formateur/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService service;

    // Create
    @PostMapping
    public Certificate create(@RequestBody CreateCertificate request) {
        return service.create(request);
    }

    // Get all
    @GetMapping
    public List<Certificate> getAll() {
        return service.getAll();
    }

    // Get by id
    @GetMapping("/{id}")
    public Certificate getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // Get by apprenant
    @GetMapping("/apprenant/{apprenantId}")
    public List<Certificate> getByApprenant(@PathVariable Long apprenantId) {
        return service.getByApprenant(apprenantId);
    }

    // Update
    @PutMapping("/{id}")
    public Certificate update(@PathVariable Long id,
                              @RequestBody UpdateCertificate request) {
        return service.update(id, request);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
