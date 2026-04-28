# 🔧 FIX BACKEND MAILING - GUIDE COMPLET

## 🚨 PROBLÈME ACTUEL
Le backend B2B (port 8083) est **CRASHÉ** car le code mailing a introduit une erreur.
L'erreur est probablement un problème d'injection de dépendance (`EmailService` bean failure).

---

## ✅ ÉTAPE 1 : Vérifier le pom.xml

Ouvrir ton `pom.xml` du module B2B et vérifier que cette dépendance existe :

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

**⚠️ NE PAS utiliser `javax.mail` ou `jakarta.mail` directement** — utilise uniquement `spring-boot-starter-mail`.

---

## ✅ ÉTAPE 2 : application.properties (ou application.yml)

Ajouter ces propriétés (si elles n'y sont pas déjà) :

```properties
# ===== EMAIL CONFIGURATION =====
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# Eureka (si tu utilises pas Eureka, garder disabled)
eureka.client.enabled=false
```

---

## ✅ ÉTAPE 3 : EmailNotificationDTO.java

Créer le fichier dans ton package DTO (par exemple `tn.esprit.b2b.dto`).

**⚠️ IMPORTANT** : Le package doit être dans le **même module** que ton `ApplicationController`.

```java
package tn.esprit.b2b.dto;

public class EmailNotificationDTO {
    
    private String candidateEmail;
    private String candidateName;
    private String jobTitle;
    private String companyName;
    private String status;    // "ACCEPTED" ou "REJECTED"
    private String message;   // message personnalisé (optionnel)

    // Constructeur vide obligatoire
    public EmailNotificationDTO() {}

    // Constructeur complet
    public EmailNotificationDTO(String candidateEmail, String candidateName, 
                                 String jobTitle, String companyName, 
                                 String status, String message) {
        this.candidateEmail = candidateEmail;
        this.candidateName = candidateName;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.status = status;
        this.message = message;
    }

    // Getters & Setters
    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
```

---

## ✅ ÉTAPE 4 : EmailService.java

Créer le fichier dans ton package service (ex: `tn.esprit.b2b.services`).

```java
package tn.esprit.b2b.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import tn.esprit.b2b.dto.EmailNotificationDTO;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Envoyer un email HTML au candidat (accepté ou rejeté)
     */
    public void sendCandidateNotification(EmailNotificationDTO dto) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(dto.getCandidateEmail());
            
            // Subject
            String emoji = "ACCEPTED".equals(dto.getStatus()) ? "🎉" : "📩";
            helper.setSubject(emoji + " Application Update — " + dto.getJobTitle() + " at " + dto.getCompanyName());

            // HTML Body
            String htmlContent = buildHtmlEmail(dto);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Email envoyé à : " + dto.getCandidateEmail());

        } catch (MessagingException e) {
            System.err.println("❌ Erreur envoi email à " + dto.getCandidateEmail() + " : " + e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private String buildHtmlEmail(EmailNotificationDTO dto) {
        boolean accepted = "ACCEPTED".equals(dto.getStatus());
        String statusColor = accepted ? "#22c55e" : "#ef4444";
        String statusText = accepted ? "Accepted ✅" : "Not Retained";
        String headerBg = accepted 
            ? "linear-gradient(135deg, #22c55e, #16a34a)" 
            : "linear-gradient(135deg, #ef4444, #dc2626)";

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head>");
        sb.append("<body style='margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;'>");
        sb.append("<div style='max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);margin-top:20px;margin-bottom:20px;'>");
        
        // Header
        sb.append("<div style='background:").append(headerBg).append(";padding:32px 28px;text-align:center;'>");
        sb.append("<h1 style='color:#ffffff;margin:0;font-size:24px;'>").append(accepted ? "🎉 Congratulations!" : "📩 Application Update").append("</h1>");
        sb.append("<p style='color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;'>Your application status has been updated</p>");
        sb.append("</div>");

        // Body
        sb.append("<div style='padding:32px 28px;'>");
        sb.append("<p style='font-size:16px;color:#334155;line-height:1.6;'>Dear <strong>").append(dto.getCandidateName()).append("</strong>,</p>");

        if (accepted) {
            sb.append("<p style='font-size:15px;color:#334155;line-height:1.7;'>We are delighted to inform you that your application for the position of ");
            sb.append("<strong>").append(dto.getJobTitle()).append("</strong> at <strong>").append(dto.getCompanyName()).append("</strong> ");
            sb.append("has been <span style='color:").append(statusColor).append(";font-weight:700;'>accepted</span>! 🎉</p>");
            sb.append("<p style='font-size:15px;color:#334155;'>Our HR team will contact you shortly with the next steps.</p>");
        } else {
            sb.append("<p style='font-size:15px;color:#334155;line-height:1.7;'>Thank you for your interest in the position of ");
            sb.append("<strong>").append(dto.getJobTitle()).append("</strong> at <strong>").append(dto.getCompanyName()).append("</strong>. ");
            sb.append("After careful review, we regret to inform you that your application has not been ");
            sb.append("<span style='color:").append(statusColor).append(";font-weight:700;'>retained</span> at this time.</p>");
            sb.append("<p style='font-size:15px;color:#334155;'>We encourage you to apply for future openings that match your profile.</p>");
        }

        // Custom message from RH
        if (dto.getMessage() != null && !dto.getMessage().trim().isEmpty()) {
            sb.append("<div style='margin:20px 0;padding:16px;border-left:4px solid #6366f1;background:rgba(99,102,241,0.04);border-radius:0 8px 8px 0;'>");
            sb.append("<p style='margin:0;font-size:14px;color:#475569;font-style:italic;'>\"").append(dto.getMessage()).append("\"</p>");
            sb.append("</div>");
        }

        // Status badge
        sb.append("<div style='text-align:center;margin:24px 0;'>");
        sb.append("<span style='display:inline-block;padding:8px 24px;border-radius:20px;font-size:14px;font-weight:700;color:#fff;background:").append(statusColor).append(";'>");
        sb.append("Status: ").append(statusText).append("</span>");
        sb.append("</div>");

        // Info table
        sb.append("<table style='width:100%;border-collapse:collapse;margin:20px 0;'>");
        sb.append("<tr><td style='padding:10px 14px;border:1px solid #e2e8f0;font-weight:700;color:#64748b;background:#f8fafc;width:40%;'>Position</td>");
        sb.append("<td style='padding:10px 14px;border:1px solid #e2e8f0;color:#334155;'>").append(dto.getJobTitle()).append("</td></tr>");
        sb.append("<tr><td style='padding:10px 14px;border:1px solid #e2e8f0;font-weight:700;color:#64748b;background:#f8fafc;'>Company</td>");
        sb.append("<td style='padding:10px 14px;border:1px solid #e2e8f0;color:#334155;'>").append(dto.getCompanyName()).append("</td></tr>");
        sb.append("<tr><td style='padding:10px 14px;border:1px solid #e2e8f0;font-weight:700;color:#64748b;background:#f8fafc;'>Decision</td>");
        sb.append("<td style='padding:10px 14px;border:1px solid #e2e8f0;color:").append(statusColor).append(";font-weight:700;'>").append(statusText).append("</td></tr>");
        sb.append("</table>");

        sb.append("<p style='font-size:15px;color:#334155;'>Best regards,<br><strong>").append(dto.getCompanyName()).append(" HR Team</strong></p>");
        sb.append("</div>");

        // Footer
        sb.append("<div style='background:#f8fafc;padding:16px 28px;text-align:center;border-top:1px solid #e2e8f0;'>");
        sb.append("<p style='margin:0;font-size:12px;color:#94a3b8;'>This email was sent automatically by the recruitment platform.</p>");
        sb.append("</div>");

        sb.append("</div></body></html>");
        return sb.toString();
    }
}
```

---

## ✅ ÉTAPE 5 : Modifier ApplicationController.java

**⚠️ C'EST L'ÉTAPE LA PLUS IMPORTANTE — L'erreur est probablement ici.**

Ajouter ces 2 endpoints **DANS** ton `ApplicationController` existant sans casser les endpoints `getAll()`, `getById()`, etc.

```java
package tn.esprit.b2b.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.b2b.dto.EmailNotificationDTO;
import tn.esprit.b2b.entities.Application;
import tn.esprit.b2b.services.ApplicationService;
import tn.esprit.b2b.services.EmailService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/b2b/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired(required = false)  // ⬅️ IMPORTANT: required = false pour éviter le crash si EmailService n'est pas dispo
    private EmailService emailService;

    // ========= ENDPOINTS EXISTANTS (NE PAS MODIFIER) =========

    @GetMapping
    public ResponseEntity<List<Application>> getAll() {
        return ResponseEntity.ok(applicationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getById(id));
    }

    @GetMapping("/job-offer/{jobOfferId}")
    public ResponseEntity<List<Application>> getByJobOffer(@PathVariable Long jobOfferId) {
        return ResponseEntity.ok(applicationService.getByJobOffer(jobOfferId));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Application>> getByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(applicationService.getByCandidate(candidateId));
    }

    @GetMapping("/job-offer/{jobOfferId}/top")
    public ResponseEntity<List<Application>> getTopByJobOffer(@PathVariable Long jobOfferId) {
        return ResponseEntity.ok(applicationService.getTopByJobOffer(jobOfferId));
    }

    @PostMapping
    public ResponseEntity<Application> create(@RequestBody Application app) {
        return ResponseEntity.ok(applicationService.create(app));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(applicationService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        applicationService.delete(id);
        return ResponseEntity.ok().build();
    }

    // ========= NOUVEAUX ENDPOINTS MAILING =========

    /**
     * POST /api/b2b/applications/notify
     * Envoyer un email de notification au candidat
     */
    @PostMapping("/notify")
    public ResponseEntity<?> sendNotification(@RequestBody EmailNotificationDTO dto) {
        try {
            if (emailService == null) {
                return ResponseEntity.status(503)
                    .body(Map.of("error", "Email service not configured", 
                                 "message", "Add spring-boot-starter-mail dependency and configure SMTP"));
            }
            emailService.sendCandidateNotification(dto);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email sent successfully to " + dto.getCandidateEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to send email", "details", e.getMessage()));
        }
    }

    /**
     * PUT /api/b2b/applications/{id}/status-notify
     * Mettre à jour le statut ET envoyer un email en une seule opération
     */
    @PutMapping("/{id}/status-notify")
    public ResponseEntity<?> updateStatusAndNotify(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestBody EmailNotificationDTO dto) {
        try {
            // Step 1: Update status
            Application updated = applicationService.updateStatus(id, status);

            // Step 2: Send email (si le service est disponible)
            if (emailService != null) {
                try {
                    emailService.sendCandidateNotification(dto);
                } catch (Exception emailErr) {
                    System.err.println("⚠️ Status updated but email failed: " + emailErr.getMessage());
                    // On retourne quand même le résultat car le statut a été mis à jour
                }
            }

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to update status", "details", e.getMessage()));
        }
    }
}
```

---

## 🔑 POINTS CRITIQUES À VÉRIFIER

### 1. Le `@Autowired(required = false)` sur `EmailService`
C'est **LA CLE** : si `required = true` (valeur par défaut) et que le bean `EmailService` ne peut pas être créé (mauvaise config mail, dépendance manquante), **TOUT LE CONTROLLER CRASH** et **AUCUN endpoint ne fonctionne**.

### 2. Le package `jakarta.mail` vs `javax.mail`
- Si tu utilises **Spring Boot 3.x** → utilise `jakarta.mail.*`
- Si tu utilises **Spring Boot 2.x** → utilise `javax.mail.*`

### 3. L'import `Map.of()` nécessite **Java 9+**
Si tu utilises Java 8, remplace `Map.of(...)` par :
```java
Map<String, Object> response = new HashMap<>();
response.put("success", true);
response.put("message", "...");
return ResponseEntity.ok(response);
```

---

## ✅ ÉTAPE 6 : Test rapide

Après avoir redémarré le backend :

```bash
# Test 1: Vérifier que les applications marchent
curl http://localhost:8083/api/b2b/applications

# Test 2: Envoyer un email de test
curl -X POST http://localhost:8083/api/b2b/applications/notify \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "aziz2guizeni@gmail.com",
    "candidateName": "Test User",
    "jobTitle": "Data Analyst",
    "companyName": "MarketingPro",
    "status": "ACCEPTED",
    "message": "Bienvenue dans notre équipe!"
  }'
```

---

## 🎯 RÉSUMÉ DES CHANGEMENTS

| Fichier | Action | Risque |
|---------|--------|--------|
| `pom.xml` | Vérifier `spring-boot-starter-mail` | Faible |
| `application.properties` | Ajouter config SMTP | Faible |
| `EmailNotificationDTO.java` | Créer (nouveau fichier) | Faible |
| `EmailService.java` | Créer (nouveau fichier) | Moyen |
| `ApplicationController.java` | Ajouter 2 endpoints + `@Autowired(required=false)` | **CRITIQUE** |

**L'erreur la plus probable** : `@Autowired private EmailService emailService;` **sans** `required = false` → si le bean ne peut pas être créé, Spring refuse de démarrer tout le controller → **TOUS les endpoints `/applications/*` crashent**.

---

## 💡 Raccourci : Si tu veux juste que ça marche SANS email

Si le mail ne marche toujours pas, change temporairement `EmailService` pour simuler :

```java
@Service
public class EmailService {
    
    public void sendCandidateNotification(EmailNotificationDTO dto) {
        // TEMPORAIRE: juste logger au lieu d'envoyer
        System.out.println("📧 [SIMULATED] Email to: " + dto.getCandidateEmail());
        System.out.println("    Status: " + dto.getStatus());
        System.out.println("    Job: " + dto.getJobTitle() + " at " + dto.getCompanyName());
        System.out.println("    Message: " + dto.getMessage());
    }
}
```

Cela évite d'avoir besoin de la dépendance `spring-boot-starter-mail` pour tester le reste.
