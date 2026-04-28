package org.example.b2bmodule.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.b2bmodule.dto.EmailNotificationDTO;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendApplicationNotification(EmailNotificationDTO dto) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(dto.getCandidateEmail());
        helper.setSubject("🎯 Application Update - " + dto.getJobTitle() + " at " + dto.getCompanyName());
        helper.setText(buildEmailContent(dto), true);

        mailSender.send(message);
        log.info("Email sent to: {}", dto.getCandidateEmail());
    }

    private String buildEmailContent(EmailNotificationDTO dto) {
        String statusColor = "ACCEPTED".equals(dto.getStatus()) ? "#10b981" : "#6b7280";
        String statusIcon = "ACCEPTED".equals(dto.getStatus()) ? "✅" : "📋";
        String statusMessage = "ACCEPTED".equals(dto.getStatus()) 
            ? "Congratulations! Your application has been ACCEPTED!" 
            : "Thank you for your application. After careful review, we have decided not to move forward at this time.";

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset='UTF-8'></head><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>");
        html.append("<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;'>");
        
        // Header
        html.append("<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'>");
        html.append("<h1 style='margin: 0; font-size: 24px;'>🎯 B2B PLATFORM</h1>");
        html.append("<p style='margin: 10px 0 0 0; font-size: 16px;'>Application Update</p>");
        html.append("</div>");
        
        // Body
        html.append("<div style='padding: 30px; background: white;'>");
        html.append("<p style='font-size: 16px;'>Dear <strong>").append(escapeHtml(dto.getCandidateName())).append("</strong>,</p>");
        
        // Status Block
        html.append("<div style='background: ").append(statusColor).append("; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;'>");
        html.append("<div style='font-size: 32px; margin-bottom: 10px;'>").append(statusIcon).append("</div>");
        html.append("<h2 style='margin: 0; font-size: 20px;'>").append(dto.getStatus()).append("</h2>");
        html.append("</div>");
        
        html.append("<p style='font-size: 15px;'>").append(statusMessage).append("</p>");
        
        // HR Message (if provided)
        if (dto.getMessage() != null && !dto.getMessage().trim().isEmpty()) {
            html.append("<div style='background: #f3f4f6; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;'>");
            html.append("<p style='margin: 0; font-weight: bold; color: #667eea;'>📌 Message from HR Team:</p>");
            html.append("<p style='margin: 10px 0 0 0;'>").append(escapeHtml(dto.getMessage())).append("</p>");
            html.append("</div>");
        }
        
        html.append("<p style='font-size: 14px; color: #6b7280; margin-top: 30px;'>Best regards,<br>");
        html.append("The <strong>").append(escapeHtml(dto.getCompanyName())).append("</strong> HR Team</p>");
        html.append("</div>");
        
        // Footer
        html.append("<div style='background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;'>");
        html.append("<p style='margin: 0;'>This is an automated email from ").append(escapeHtml(dto.getCompanyName())).append(" HR Portal</p>");
        html.append("<p style='margin: 5px 0 0 0;'>© 2026 B2B Platform. All rights reserved.</p>");
        html.append("</div>");
        
        html.append("</div></body></html>");
        
        return html.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
