package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.certificate.AttemptHistoryItemDto;
import com.example.platformevaluationservice.evalution.dto.certificate.CertificateRequestDetailDto;
import com.example.platformevaluationservice.evalution.dto.certificate.CertificateResponseDto;
import com.example.platformevaluationservice.evalution.dto.certificate.RequestCertificateDto;
import com.example.platformevaluationservice.evalution.dto.internal.UserContactDto;
import com.example.platformevaluationservice.evalution.model.Attempt;
import com.example.platformevaluationservice.evalution.model.Certificate;
import com.example.platformevaluationservice.evalution.model.CertificateStatus;
import com.example.platformevaluationservice.evalution.model.Evaluation;
import com.example.platformevaluationservice.evalution.model.EvaluationStatus;
import com.example.platformevaluationservice.evalution.repository.AttemptRepository;
import com.example.platformevaluationservice.evalution.repository.CertificateRepository;
import com.example.platformevaluationservice.evalution.repository.EvaluationRepository;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final EvaluationRepository evaluationRepository;
    private final AttemptRepository attemptRepository;
    private final UserContactLookupService userContactLookupService;
    private final CertificateNotificationService certificateNotificationService;

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

        Certificate savedCertificate = certificateRepository.save(certificate);
        notifyFormateurOnRequest(savedCertificate);

        return toDto(savedCertificate);
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
        if (certificate.getStatus() != CertificateStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certificate PDF is not available yet");
        }

        // Always regenerate on download so previously approved certificates pick up latest design updates.
        if (certificate.getIssuedAt() == null) {
            certificate.setIssuedAt(Instant.now());
        }
        if (certificate.getPdfFileName() == null || certificate.getPdfFileName().isBlank()) {
            certificate.setPdfFileName(buildPdfFileName(certificate));
        }

        byte[] regeneratedPdf = generatePdf(certificate);
        certificate.setPdfContent(regeneratedPdf);
        certificateRepository.save(certificate);

        return regeneratedPdf;
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

    private void notifyFormateurOnRequest(Certificate certificate) {
        if (certificate.getFormateurId() == null) {
            log.warn("Skip formateur notification for certificateId={} because formateurId is missing", certificate.getId());
            return;
        }

        try {
            UserContactDto formateur = userContactLookupService.findUserContact(certificate.getFormateurId())
                    .orElse(null);

            if (formateur == null || formateur.email() == null || formateur.email().isBlank()) {
                log.warn("Skip formateur notification for certificateId={} because formateur email is unavailable", certificate.getId());
                return;
            }

            String formateurFullName = ((formateur.firstName() != null ? formateur.firstName() : "")
                    + " "
                    + (formateur.lastName() != null ? formateur.lastName() : "")).trim();

            certificateNotificationService.sendCertificateRequestNotification(
                    formateur.email(),
                    formateurFullName,
                    certificate
            );
        } catch (Exception ex) {
            // Do not fail certificate request persistence if notification fails.
            log.warn("Failed to send formateur notification for certificateId={}: {}", certificate.getId(), ex.getMessage());
        }
    }

    private byte[] generatePdf(Certificate certificate) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 48, 48, 42, 42);
            PdfWriter writer = PdfWriter.getInstance(document, output);
            document.open();

            Color blue = new Color(32, 57, 125);
            drawCertificateFrame(writer, document, blue);

            Font titleFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 56, blue);
            Font ribbonFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 20, Color.WHITE);
            Font brandFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 20, blue);
            Font subtitleFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 18, blue);
            Font nameFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 36, blue);
            Font bodyFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 17, blue);
            Font smallFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 14, blue);
            Font signatureFont = FontFactory.getFont(FontFactory.TIMES_ITALIC, 22, blue);

            Paragraph topSpacer = new Paragraph(" ");
            topSpacer.setSpacingAfter(6);
            document.add(topSpacer);

            Paragraph title = new Paragraph("CERTIFICATE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(8);
            document.add(title);

            Chunk ribbonChunk = new Chunk("  OF ACHIEVEMENT  ", ribbonFont);
            ribbonChunk.setBackground(blue, 10, 8, 10, 8);
            Paragraph ribbon = new Paragraph(ribbonChunk);
            ribbon.setAlignment(Element.ALIGN_CENTER);
            ribbon.setSpacingAfter(20);
            document.add(ribbon);

            Paragraph brand = new Paragraph("SkillSphere", brandFont);
            brand.setAlignment(Element.ALIGN_CENTER);
            brand.setSpacingAfter(6);
            document.add(brand);

            Paragraph intro = new Paragraph("This certificate is proudly presented to", subtitleFont);
            intro.setAlignment(Element.ALIGN_CENTER);
            intro.setSpacingAfter(22);
            document.add(intro);

            String fullName = (certificate.getApprenantFirstName() + " " + certificate.getApprenantLastName()).trim();
            Paragraph name = new Paragraph(fullName, nameFont);
            name.setAlignment(Element.ALIGN_CENTER);
            name.setSpacingAfter(10);
            document.add(name);

            Paragraph line = new Paragraph("________________________________________", smallFont);
            line.setAlignment(Element.ALIGN_CENTER);
            line.setSpacingAfter(22);
            document.add(line);

            Paragraph awardedFor = new Paragraph(
                    "for successfully completing the evaluation \"" + certificate.getEvaluationTitle() + "\"", bodyFont);
            awardedFor.setAlignment(Element.ALIGN_CENTER);
            awardedFor.setSpacingAfter(10);
            document.add(awardedFor);

            String issuedDate = DateTimeFormatter.ofPattern("yyyy-MM-dd")
                    .withZone(ZoneId.systemDefault())
                    .format(certificate.getIssuedAt());
            Paragraph scoreLine = new Paragraph(
                    "Score: " + certificate.getBestScore() + "%    |    Issued on: " + issuedDate,
                    smallFont);
            scoreLine.setAlignment(Element.ALIGN_CENTER);
            scoreLine.setSpacingAfter(26);
            document.add(scoreLine);

            Paragraph motivation = new Paragraph(
                    "Hopefully this award can be a motivation to further improve your abilities in the future.",
                    bodyFont);
            motivation.setAlignment(Element.ALIGN_CENTER);
            motivation.setSpacingAfter(30);
            document.add(motivation);

            String signatureName = "Supervisor";
            Paragraph signScript = new Paragraph(signatureName, signatureFont);
            signScript.setAlignment(Element.ALIGN_RIGHT);
            signScript.setSpacingAfter(2);
            document.add(signScript);

            Paragraph signLine = new Paragraph("____________________", smallFont);
            signLine.setAlignment(Element.ALIGN_RIGHT);
            signLine.setSpacingAfter(2);
            document.add(signLine);

            Paragraph signLabel = new Paragraph("SkillSphere Supervisor", smallFont);
            signLabel.setAlignment(Element.ALIGN_RIGHT);
            signLabel.setSpacingAfter(4);
            document.add(signLabel);

            Paragraph certCode = new Paragraph(
                    "Certificate No: CERT-" + certificate.getEvaluationId() + "-" + certificate.getId(),
                    smallFont);
            certCode.setAlignment(Element.ALIGN_LEFT);
            document.add(certCode);

            document.close();
            return output.toByteArray();
        } catch (DocumentException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate certificate PDF");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error while generating certificate PDF");
        }
    }

    private void drawCertificateFrame(PdfWriter writer, Document document, Color frameColor) {
        PdfContentByte canvas = writer.getDirectContentUnder();
        Rectangle page = document.getPageSize();

        float left = 26f;
        float right = page.getWidth() - 26f;
        float bottom = 24f;
        float top = page.getHeight() - 24f;

        canvas.saveState();
        canvas.setColorStroke(frameColor);

        // Double border
        canvas.setLineWidth(2f);
        canvas.rectangle(left, bottom, right - left, top - bottom);
        canvas.stroke();

        canvas.setLineWidth(0.9f);
        canvas.rectangle(left + 6, bottom + 6, right - left - 12, top - bottom - 12);
        canvas.stroke();

        // Top and bottom center ornaments (simple line accents)
        float centerX = page.getWidth() / 2f;
        canvas.setLineWidth(1.3f);
        canvas.moveTo(centerX - 190f, top - 14f);
        canvas.lineTo(centerX + 190f, top - 14f);
        canvas.stroke();

        canvas.moveTo(centerX - 190f, bottom + 14f);
        canvas.lineTo(centerX + 190f, bottom + 14f);
        canvas.stroke();

        // Corner accents to mimic ornamental feel
        drawCornerAccent(canvas, left + 12f, top - 12f, 1, -1);
        drawCornerAccent(canvas, right - 12f, top - 12f, -1, -1);
        drawCornerAccent(canvas, left + 12f, bottom + 12f, 1, 1);
        drawCornerAccent(canvas, right - 12f, bottom + 12f, -1, 1);

        canvas.restoreState();
    }

    private void drawCornerAccent(PdfContentByte canvas, float x, float y, int dirX, int dirY) {
        canvas.setLineWidth(1f);
        canvas.circle(x, y, 10f);
        canvas.stroke();

        canvas.moveTo(x, y);
        canvas.lineTo(x + (42f * dirX), y);
        canvas.stroke();

        canvas.moveTo(x, y);
        canvas.lineTo(x, y + (42f * dirY));
        canvas.stroke();

        canvas.circle(x + (20f * dirX), y + (20f * dirY), 4f);
        canvas.stroke();
    }
}
