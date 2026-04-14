package com.example.platformevaluationservice.evalution.controller;

import com.example.platformevaluationservice.evalution.dto.certificate.CertificateResponseDto;
import com.example.platformevaluationservice.evalution.dto.certificate.RequestCertificateDto;
import com.example.platformevaluationservice.evalution.security.SecurityUtils;
import com.example.platformevaluationservice.evalution.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apprenant/certificates")
@RequiredArgsConstructor
public class ApprenantCertificateController {

    private final CertificateService service;
    private final SecurityUtils securityUtils;

    @PostMapping("/request")
    public CertificateResponseDto requestCertificate(@RequestBody RequestCertificateDto request) {
        Long apprenantId = securityUtils.currentUserId();
        return service.requestCertificate(apprenantId, request);
    }

    @GetMapping
    public List<CertificateResponseDto> getMyCertificates() {
        Long apprenantId = securityUtils.currentUserId();
        return service.getCertificatesForApprenant(apprenantId);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        Long apprenantId = securityUtils.currentUserId();
        byte[] pdf = service.downloadCertificateForApprenant(apprenantId, id);
        String filename = "certificate-" + id + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }
}
