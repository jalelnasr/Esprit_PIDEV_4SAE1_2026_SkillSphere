package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.certificate.AttemptHistoryItemDto;
import com.example.platformevaluationservice.evalution.dto.certificate.CertificateRequestDetailDto;
import com.example.platformevaluationservice.evalution.dto.certificate.CertificateResponseDto;
import com.example.platformevaluationservice.evalution.dto.certificate.RequestCertificateDto;
import com.example.platformevaluationservice.evalution.model.Attempt;
import com.example.platformevaluationservice.evalution.model.Certificate;
import com.example.platformevaluationservice.evalution.model.CertificateStatus;
import com.example.platformevaluationservice.evalution.model.Evaluation;
import com.example.platformevaluationservice.evalution.model.EvaluationStatus;
import com.example.platformevaluationservice.evalution.repository.AttemptRepository;
import com.example.platformevaluationservice.evalution.repository.CertificateRepository;
import com.example.platformevaluationservice.evalution.repository.EvaluationRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final EvaluationRepository evaluationRepository;
    private final AttemptRepository attemptRepository;

    @Override
    public CertificateResponseDto requestCertificate(Long apprenantId, RequestCertificateDto request) {
        if (request == null || request.getEvaluationId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "evaluationId is required");
        }

        Evaluation evaluation = evaluationRepository.findById(request.getEvaluationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evaluation not found"));

        if (evaluation.getStatus() != EvaluationStatus.PUBLISHED || evaluation.getQuiz() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evaluation is not eligible for certificate request");
        }

        Attempt bestAttempt = attemptRepository
                .findTopByApprenantIdAndEvaluation_IdOrderByScoreDesc(apprenantId, evaluation.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "You must pass this evaluation before requesting a certificate"));

        int bestScore = bestAttempt.getScore() != null ? (int) Math.round(bestAttempt.getScore()) : 0;
        int passingScore = evaluation.getQuiz().getPassingScore() != null ? evaluation.getQuiz().getPassingScore() : 0;
        boolean passed = bestScore >= passingScore;

        if (!passed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You must pass this evaluation before requesting a certificate");
        }

        certificateRepository.findByApprenantIdAndEvaluationId(apprenantId, evaluation.getId())
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Certificate request already exists for this evaluation");
                });

        Certificate certificate = Certificate.builder()
                .apprenantId(apprenantId)
                .apprenantFirstName(defaultName(request.getApprenantFirstName(), "Apprenant"))
                .apprenantLastName(defaultName(request.getApprenantLastName(), String.valueOf(apprenantId)))
                .evaluationId(evaluation.getId())
                .evaluationTitle(evaluation.getTitle())
                .formateurId(evaluation.getFormateurId())
                .bestScore(bestScore)
                .passed(true)
                .status(CertificateStatus.PENDING)
                .title("Certificate - " + evaluation.getTitle())
                .description("Certificate request for evaluation " + evaluation.getTitle())
                .build();

        return toDto(certificateRepository.save(certificate));
    }

    @Override
    public List<CertificateResponseDto> getCertificatesForApprenant(Long apprenantId) {
        return certificateRepository.findByApprenantIdOrderByRequestedAtDesc(apprenantId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public byte[] downloadCertificateForApprenant(Long apprenantId, Long certificateId) {
        Certificate certificate = getCertificateOrThrow(certificateId);
        if (!apprenantId.equals(certificate.getApprenantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this certificate");
        }
        return ensureDownloadable(certificate);
    }

    @Override
    public List<CertificateRequestDetailDto> getRequestsForFormateur(Long formateurId, CertificateStatus status) {
        List<Certificate> certificates = status == null
                ? certificateRepository.findByFormateurIdOrderByRequestedAtDesc(formateurId)
                : certificateRepository.findByFormateurIdAndStatusOrderByRequestedAtDesc(formateurId, status);

        return certificates.stream().map(this::toDetailDto).toList();
    }

    @Override
    public CertificateResponseDto approveRequest(Long formateurId, Long certificateId, String note) {
        Certificate certificate = getCertificateOrThrow(certificateId);
        validateFormateurOwnership(formateurId, certificate);

        if (certificate.getStatus() != CertificateStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending requests can be approved");
        }
        if (!Boolean.TRUE.equals(certificate.getPassed())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apprenant does not meet criteria for certificate");
        }

        certificate.setStatus(CertificateStatus.APPROVED);
        certificate.setIssuedAt(Instant.now());
        certificate.setNote(note);
        certificate.setPdfFileName(buildPdfFileName(certificate));
        certificate.setPdfContent(generatePdf(certificate));

        return toDto(certificateRepository.save(certificate));
    }

    @Override
    public CertificateResponseDto rejectRequest(Long formateurId, Long certificateId, String note) {
        Certificate certificate = getCertificateOrThrow(certificateId);
        validateFormateurOwnership(formateurId, certificate);

        if (certificate.getStatus() != CertificateStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending requests can be rejected");
        }

        certificate.setStatus(CertificateStatus.REJECTED);
        certificate.setNote(note);
        return toDto(certificateRepository.save(certificate));
    }

    @Override
    public byte[] downloadCertificateForFormateur(Long formateurId, Long certificateId) {
        Certificate certificate = getCertificateOrThrow(certificateId);
        validateFormateurOwnership(formateurId, certificate);
        return ensureDownloadable(certificate);
    }

    private Certificate getCertificateOrThrow(Long certificateId) {
        return certificateRepository.findById(certificateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate not found"));
    }

    private void validateFormateurOwnership(Long formateurId, Certificate certificate) {
        if (!formateurId.equals(certificate.getFormateurId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot manage this request");
        }
    }

    private byte[] ensureDownloadable(Certificate certificate) {
        if (certificate.getStatus() != CertificateStatus.APPROVED || certificate.getPdfContent() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certificate PDF is not available yet");
        }
        return certificate.getPdfContent();
    }

    private CertificateRequestDetailDto toDetailDto(Certificate certificate) {
        CertificateRequestDetailDto detail = new CertificateRequestDetailDto();
        copyBase(detail, certificate);
        List<AttemptHistoryItemDto> history = attemptRepository
                .findByApprenantIdAndEvaluation_IdOrderBySubmittedAtDesc(certificate.getApprenantId(), certificate.getEvaluationId())
                .stream()
                .map(attempt -> {
                    AttemptHistoryItemDto item = new AttemptHistoryItemDto();
                    item.setScore(attempt.getScore() != null ? (int) Math.round(attempt.getScore()) : 0);
                    item.setPassed(Boolean.TRUE.equals(attempt.getPassed()));
                    item.setSubmittedAt(attempt.getSubmittedAt());
                    return item;
                })
                .toList();
        detail.setAttemptHistory(history);
        return detail;
    }

    private CertificateResponseDto toDto(Certificate certificate) {
        CertificateResponseDto dto = new CertificateResponseDto();
        copyBase(dto, certificate);
        return dto;
    }

    private void copyBase(CertificateResponseDto dto, Certificate certificate) {
        dto.setId(certificate.getId());
        dto.setApprenantId(certificate.getApprenantId());
        dto.setApprenantFirstName(certificate.getApprenantFirstName());
        dto.setApprenantLastName(certificate.getApprenantLastName());
        dto.setEvaluationId(certificate.getEvaluationId());
        dto.setEvaluationTitle(certificate.getEvaluationTitle());
        dto.setFormateurId(certificate.getFormateurId());
        dto.setBestScore(certificate.getBestScore());
        dto.setPassed(certificate.getPassed());
        dto.setStatus(certificate.getStatus());
        dto.setNote(certificate.getNote());
        dto.setRequestedAt(certificate.getRequestedAt());
        dto.setIssuedAt(certificate.getIssuedAt());
        dto.setPdfFileName(certificate.getPdfFileName());
    }

    private String defaultName(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private String buildPdfFileName(Certificate certificate) {
        String safeName = (certificate.getApprenantFirstName() + "_" + certificate.getApprenantLastName())
                .replaceAll("[^a-zA-Z0-9_]+", "_");
        return "certificate_" + certificate.getEvaluationId() + "_" + safeName + ".pdf";
    }

    private byte[] generatePdf(Certificate certificate) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, output);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 14);

            Paragraph title = new Paragraph("Certificate of Completion", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            Paragraph certifies = new Paragraph("This is to certify that", normalFont);
            certifies.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(certifies);

            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph name = new Paragraph(certificate.getApprenantFirstName() + " " + certificate.getApprenantLastName(), nameFont);
            name.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(name);

            Paragraph completed = new Paragraph("has successfully completed the evaluation", normalFont);
            completed.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(completed);

            Font evalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph evaluation = new Paragraph(certificate.getEvaluationTitle(), evalFont);
            evaluation.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(evaluation);
            document.add(new Paragraph(" "));

            String issuedDate = DateTimeFormatter.ofPattern("yyyy-MM-dd")
                    .withZone(ZoneId.systemDefault())
                    .format(certificate.getIssuedAt());
            Paragraph details = new Paragraph("Issued on " + issuedDate + " | Score: " + certificate.getBestScore() + "%", normalFont);
            details.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(details);

            document.close();
            return output.toByteArray();
        } catch (DocumentException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate certificate PDF");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error while generating certificate PDF");
        }
    }
}
