package com.example.platformevaluationservice.evalution.controller;

import com.example.platformevaluationservice.evalution.dto.certificate.CertificateDecisionDto;
import com.example.platformevaluationservice.evalution.dto.certificate.CertificateRequestDetailDto;
import com.example.platformevaluationservice.evalution.dto.certificate.CertificateResponseDto;
import com.example.platformevaluationservice.evalution.model.CertificateStatus;
import com.example.platformevaluationservice.evalution.security.SecurityUtils;
import com.example.platformevaluationservice.evalution.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formateur/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService service;
    private final SecurityUtils securityUtils;

    @GetMapping("/requests")
    public List<CertificateRequestDetailDto> getRequests(@RequestParam(required = false) CertificateStatus status) {
        Long formateurId = securityUtils.currentUserId();
        return service.getRequestsForFormateur(formateurId, status);
    }

    @PostMapping("/{id}/approve")
    public CertificateResponseDto approve(@PathVariable Long id, @RequestBody(required = false) CertificateDecisionDto request) {
        Long formateurId = securityUtils.currentUserId();
        String note = request != null ? request.getNote() : null;
        return service.approveRequest(formateurId, id, note);
    }

    @PostMapping("/{id}/reject")
    public CertificateResponseDto reject(@PathVariable Long id, @RequestBody(required = false) CertificateDecisionDto request) {
        Long formateurId = securityUtils.currentUserId();
        String note = request != null ? request.getNote() : null;
        return service.rejectRequest(formateurId, id, note);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        Long formateurId = securityUtils.currentUserId();
        byte[] pdf = service.downloadCertificateForFormateur(formateurId, id);
        String filename = "certificate-" + id + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }
}
