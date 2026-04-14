package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.model.Certificate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.notifications.certificates.enabled:true}")
    private boolean notificationEnabled;

    @Value("${app.notifications.certificates.from:}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendCertificateRequestNotification(String formateurEmail, String formateurName, Certificate certificate) {
        if (!notificationEnabled) {
            log.info("Certificate email notification disabled by configuration");
            return;
        }

        if (formateurEmail == null || formateurEmail.isBlank()) {
            log.warn("Skip certificate request email: target formateur email is missing for certificateId={}", certificate.getId());
            return;
        }

        if (mailUsername == null || mailUsername.isBlank()) {
            log.warn("Skip certificate request email: spring.mail.username is not configured");
            return;
        }

        String safeFormateurName = (formateurName == null || formateurName.isBlank()) ? "Formateur" : formateurName.trim();
        String apprenantName = (certificate.getApprenantFirstName() + " " + certificate.getApprenantLastName()).trim();

        SimpleMailMessage message = new SimpleMailMessage();
        if (fromAddress != null && !fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }
        message.setTo(formateurEmail);
        message.setSubject("New certificate request - " + certificate.getEvaluationTitle());
        message.setText(
                "Hello " + safeFormateurName + ",\n\n"
                        + "A new certificate request has been submitted.\n\n"
                        + "Evaluation: " + certificate.getEvaluationTitle() + "\n"
                        + "Apprenant: " + apprenantName + "\n"
                        + "Best score: " + certificate.getBestScore() + "%\n"
                        + "Requested at: " + certificate.getRequestedAt() + "\n\n"
                        + "Please review it in your dashboard.\n"
        );

        log.info("Sending certificate request email for certificateId={} to {}", certificate.getId(), formateurEmail);
        mailSender.send(message);
        log.info("Certificate request email sent for certificateId={} to {}", certificate.getId(), formateurEmail);
    }
}
