package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.certificate.CertificateRequestDetailDto;
import com.example.platformevaluationservice.evalution.dto.certificate.CertificateResponseDto;
import com.example.platformevaluationservice.evalution.dto.certificate.RequestCertificateDto;
import com.example.platformevaluationservice.evalution.model.CertificateStatus;

import java.util.List;

public interface CertificateService {

    CertificateResponseDto requestCertificate(Long apprenantId, RequestCertificateDto request);

    List<CertificateResponseDto> getCertificatesForApprenant(Long apprenantId);

    byte[] downloadCertificateForApprenant(Long apprenantId, Long certificateId);

    List<CertificateRequestDetailDto> getRequestsForFormateur(Long formateurId, CertificateStatus status);

    CertificateResponseDto approveRequest(Long formateurId, Long certificateId, String note);

    CertificateResponseDto rejectRequest(Long formateurId, Long certificateId, String note);

    byte[] downloadCertificateForFormateur(Long formateurId, Long certificateId);
}