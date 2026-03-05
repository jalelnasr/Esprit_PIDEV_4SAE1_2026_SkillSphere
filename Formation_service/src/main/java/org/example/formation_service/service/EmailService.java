package org.example.formation_service.service;

import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.util.ImageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class EmailService {
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@skillsphere.tn}")
    private String fromEmail;
    
    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    
    /**
     * Send OTP verification code via email
     */
    public void sendOtpEmail(String toEmail, String otpCode, String planName) {
        String subject = "Code de vérification SkillSphere";
        
        // Beautiful HTML email with CID logo reference
        String htmlBody = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<style>" +
            "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }" +
            ".header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 20px; text-align: center; }" +
            ".logo { max-width: 150px; height: auto; margin-bottom: 15px; }" +
            ".header h1 { color: white; margin: 0; font-size: 28px; }" +
            ".content { padding: 40px 30px; }" +
            ".otp-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }" +
            ".otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }" +
            ".info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
            ".footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "<div class='header'>" +
            "<img src='cid:logo' alt='SkillSphere Logo' class='logo'>" +
            "<h1>🔐 SkillSphere</h1>" +
            "<p style='color: white; margin: 10px 0 0 0;'>Vérification de votre abonnement</p>" +
            "</div>" +
            "<div class='content'>" +
            "<h2 style='color: #2d3748;'>Bonjour,</h2>" +
            "<p style='color: #4a5568; line-height: 1.6;'>Votre code de vérification pour activer votre abonnement <strong>%s</strong> est:</p>" +
            "<div class='otp-box'>" +
            "<div class='otp-code'>%s</div>" +
            "<p style='color: #6c757d; margin: 15px 0 0 0; font-size: 14px;'>Entrez ce code sur la page de vérification</p>" +
            "</div>" +
            "<div class='info-box'>" +
            "<p style='margin: 0; color: #856404;'><strong>⏰ Important:</strong> Ce code expire dans 10 minutes.</p>" +
            "</div>" +
            "<p style='color: #4a5568; line-height: 1.6;'>Si vous n'avez pas demandé ce code, ignorez cet email.</p>" +
            "</div>" +
            "<div class='footer'>" +
            "<p style='margin: 0;'>© 2026 SkillSphere - Plateforme d'apprentissage en ligne</p>" +
            "<p style='margin: 10px 0 0 0;'>📧 support@skillsphere.tn | 📱 26512108</p>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>",
            planName, otpCode
        );
        
        sendHtmlEmail(toEmail, subject, htmlBody);
        
        // Also log for demo purposes
        log.info("=== EMAIL: OTP Verification ===");
        log.info("To: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("OTP Code: {}", otpCode);
        log.info("Plan: {}", planName);
        log.info("===============================");
    }
    
    /**
     * Send subscription activation confirmation email with PDF invoice
     */
    public void sendSubscriptionActivatedEmail(String toEmail, String planName, LocalDateTime endDate, byte[] invoicePdf, String invoiceFilename) {
        String subject = "🎉 Abonnement " + planName + " activé - SkillSphere";
        
        // Beautiful HTML confirmation email with CID logo reference
        String htmlBody = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<style>" +
            "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }" +
            ".header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); padding: 40px 20px; text-align: center; }" +
            ".logo { max-width: 150px; height: auto; margin-bottom: 15px; }" +
            ".header h1 { color: white; margin: 0; font-size: 28px; }" +
            ".content { padding: 40px 30px; }" +
            ".success-icon { font-size: 64px; text-align: center; margin: 20px 0; }" +
            ".plan-box { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0; }" +
            ".plan-name { font-size: 28px; font-weight: bold; margin: 0 0 10px 0; }" +
            ".plan-details { font-size: 16px; opacity: 0.9; }" +
            ".info-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; }" +
            ".info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }" +
            ".info-row:last-child { border-bottom: none; }" +
            ".info-label { color: #6c757d; font-weight: 500; }" +
            ".info-value { color: #2d3748; font-weight: bold; }" +
            ".features { background: #fff; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }" +
            ".features h3 { color: #2d3748; margin: 0 0 15px 0; }" +
            ".feature-item { padding: 8px 0; color: #4a5568; }" +
            ".feature-item:before { content: '✓'; color: #10b981; font-weight: bold; margin-right: 10px; }" +
            ".cta-button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }" +
            ".footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #6c757d; font-size: 14px; }" +
            ".social-links { margin: 15px 0; }" +
            ".social-links a { color: #667eea; text-decoration: none; margin: 0 10px; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "<div class='header'>" +
            "<img src='cid:logo' alt='SkillSphere Logo' class='logo'>" +
            "<h1>✨ SkillSphere</h1>" +
            "<p style='color: white; margin: 10px 0 0 0; font-size: 18px;'>Votre abonnement est activé!</p>" +
            "</div>" +
            "<div class='content'>" +
            "<div class='success-icon'>🎉</div>" +
            "<h2 style='color: #2d3748; text-align: center;'>Félicitations!</h2>" +
            "<p style='color: #4a5568; line-height: 1.6; text-align: center; font-size: 16px;'>Votre paiement a été confirmé et votre abonnement est maintenant actif.</p>" +
            "<div class='plan-box'>" +
            "<div class='plan-name'>Plan %s</div>" +
            "<div class='plan-details'>Abonnement Premium Activé</div>" +
            "</div>" +
            "<div class='info-card'>" +
            "<div class='info-row'>" +
            "<span class='info-label'>📅 Date d'activation</span>" +
            "<span class='info-value'>%s</span>" +
            "</div>" +
            "<div class='info-row'>" +
            "<span class='info-label'>⏰ Valide jusqu'au</span>" +
            "<span class='info-value'>%s</span>" +
            "</div>" +
            "<div class='info-row'>" +
            "<span class='info-label'>📧 Email</span>" +
            "<span class='info-value'>%s</span>" +
            "</div>" +
            "</div>" +
            "<div class='features'>" +
            "<h3>🎓 Ce que vous pouvez faire maintenant:</h3>" +
            "<div class='feature-item'>Accéder à tous les cours de votre plan</div>" +
            "<div class='feature-item'>Télécharger les ressources pédagogiques</div>" +
            "<div class='feature-item'>Suivre votre progression en temps réel</div>" +
            "<div class='feature-item'>Obtenir des certificats de réussite</div>" +
            "<div class='feature-item'>Rejoindre la communauté d'apprenants</div>" +
            "</div>" +
            "<div style='text-align: center;'>" +
            "<a href='http://localhost:4200/dashboard' class='cta-button'>🚀 Commencer l'apprentissage</a>" +
            "</div>" +
            "<p style='color: #6c757d; font-size: 14px; text-align: center; margin-top: 30px;'>Besoin d'aide? Contactez notre support à <a href='mailto:support@skillsphere.tn' style='color: #667eea;'>support@skillsphere.tn</a></p>" +
            "</div>" +
            "<div class='footer'>" +
            "<p style='margin: 0; font-weight: bold; color: #2d3748;'>SkillSphere</p>" +
            "<p style='margin: 10px 0;'>Plateforme d'apprentissage en ligne</p>" +
            "<div class='social-links'>" +
            "<a href='#'>Facebook</a> | <a href='#'>Twitter</a> | <a href='#'>LinkedIn</a>" +
            "</div>" +
            "<p style='margin: 15px 0 0 0;'>📧 support@skillsphere.tn | 📱 26512108</p>" +
            "<p style='margin: 10px 0 0 0; font-size: 12px; color: #adb5bd;'>© 2026 SkillSphere. Tous droits réservés.</p>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>",
            planName,
            LocalDateTime.now().format(DATE_FORMATTER),
            endDate.format(DATE_FORMATTER),
            toEmail
        );
        
        sendHtmlEmailWithAttachment(toEmail, subject, htmlBody, invoicePdf, invoiceFilename);
        
        // Also log for demo purposes
        log.info("=== EMAIL: Subscription Activated ===");
        log.info("To: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Plan: {}", planName);
        log.info("Valid until: {}", endDate.format(DATE_FORMATTER));
        log.info("=====================================");
    }
    
    /**
     * Legacy method for backward compatibility
     */
    public void sendPaymentConfirmationEmail(Long userId, String planName, LocalDateTime endDate) {
        log.info("=== EMAIL: Payment Confirmation (Legacy) ===");
        log.info("To: User ID {}", userId);
        log.info("Subject: Abonnement {} activé - SkillSphere", planName);
        log.info("Plan: {}", planName);
        log.info("Valid until: {}", endDate.format(DATE_FORMATTER));
        log.info("===========================================");
    }
    
    /**
     * Legacy method for backward compatibility (manual payment system)
     */
    public void sendPaymentRequestEmail(Long userId, String planName, String transactionId) {
        log.info("=== EMAIL: Payment Request (Legacy) ===");
        log.info("To: User ID {}", userId);
        log.info("Subject: Demande d'abonnement {} - SkillSphere", planName);
        log.info("Plan: {}", planName);
        log.info("Transaction ID: {}", transactionId);
        log.info("========================================");
    }
    
    /**
     * Send HTML email using JavaMailSender with inline logo attachment
     */
    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        sendHtmlEmailWithAttachment(to, subject, htmlBody, null, null);
    }
    
    /**
     * Send HTML email with inline logo and optional PDF attachment
     */
    private void sendHtmlEmailWithAttachment(String to, String subject, String htmlBody, byte[] pdfAttachment, String pdfFilename) {
        if (!emailEnabled || mailSender == null) {
            log.info("📧 Email sending is disabled or not configured. Email would be sent to: {}", to);
            return;
        }
        
        try {
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                new org.springframework.mail.javamail.MimeMessageHelper(mailSender.createMimeMessage(), true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            
            // Attach logo as inline image with CID
            try {
                org.springframework.core.io.ClassPathResource logoResource = 
                    new org.springframework.core.io.ClassPathResource("static/uploads/images/logo.png");
                
                if (logoResource.exists()) {
                    helper.addInline("logo", logoResource, "image/png");
                    log.info("📎 Logo attached as inline image");
                } else {
                    log.warn("⚠️ Logo file not found, email will be sent without logo");
                }
            } catch (Exception e) {
                log.warn("⚠️ Failed to attach logo: {}", e.getMessage());
            }
            
            // Attach PDF if provided
            if (pdfAttachment != null && pdfFilename != null) {
                helper.addAttachment(pdfFilename, new org.springframework.core.io.ByteArrayResource(pdfAttachment));
                log.info("📎 PDF attachment added: {}", pdfFilename);
            }
            
            mailSender.send(helper.getMimeMessage());
            log.info("✅ HTML email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send HTML email to {}: {}", to, e.getMessage());
            // Don't throw exception - email failure shouldn't break the flow
        }
    }
    
    /**
     * Send plain text email using JavaMailSender (legacy)
     */
    private void sendEmail(String to, String subject, String body) {
        if (!emailEnabled || mailSender == null) {
            log.info("📧 Email sending is disabled or not configured. Email would be sent to: {}", to);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            log.info("✅ Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
            // Don't throw exception - email failure shouldn't break the flow
        }
    }
}
