package org.example.professional_events.controller;

import lombok.RequiredArgsConstructor;
import org.example.professional_events.entity.SmsLog;
import org.example.professional_events.entity.UserContact;
import org.example.professional_events.repository.UserContactRepository;
import org.example.professional_events.service.SmsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sms")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class SmsController {

    private final SmsService smsService;
    private final UserContactRepository userContactRepository;

    /**
     * Envoyer un SMS de test
     * POST /api/sms/send-test
     */
    @PostMapping("/send-test")
    public ResponseEntity<Map<String, Object>> sendTestSms(@RequestBody Map<String, String> request) {
        try {
            Long userId = Long.parseLong(request.get("userId"));
            String message = request.get("message");

            SmsLog smsLog = smsService.sendSms(userId, message, "GENERAL", null, null);

            Map<String, Object> response = new HashMap<>();
            response.put("success", !smsLog.getStatus().equals("FAILED"));
            response.put("smsLog", smsLog);
            response.put("message", smsLog.getStatus().equals("FAILED") ? 
                "SMS failed: " + smsLog.getErrorMessage() : "SMS sent successfully");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtenir les statistiques SMS
     * GET /api/sms/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSmsStatistics() {
        try {
            Map<String, Object> stats = smsService.getSmsStatistics();
            return new ResponseEntity<>(stats, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtenir l'historique SMS d'un utilisateur
     * GET /api/sms/user/{userId}/history
     */
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<List<SmsLog>> getUserSmsHistory(@PathVariable Long userId) {
        try {
            List<SmsLog> history = smsService.getUserSmsHistory(userId);
            return new ResponseEntity<>(history, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtenir l'historique SMS d'une compétition
     * GET /api/sms/competition/{competitionId}/history
     */
    @GetMapping("/competition/{competitionId}/history")
    public ResponseEntity<List<SmsLog>> getCompetitionSmsHistory(@PathVariable Long competitionId) {
        try {
            List<SmsLog> history = smsService.getCompetitionSmsHistory(competitionId);
            return new ResponseEntity<>(history, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Envoyer un SMS à tous les participants d'une compétition (FORMATEUR uniquement)
     * POST /api/sms/competition/{competitionId}/broadcast
     */
    @PostMapping("/competition/{competitionId}/broadcast")
    public ResponseEntity<Map<String, Object>> broadcastSmsToCompetition(
            @PathVariable Long competitionId,
            @RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            List<SmsLog> results = smsService.sendSmsToCompetitionParticipants(competitionId, message);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalSent", results.size());
            response.put("results", results);
            response.put("message", "SMS envoyé à " + results.size() + " participant(s)");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mettre à jour les préférences de contact d'un utilisateur
     * PUT /api/sms/user/{userId}/contact
     */
    @PutMapping("/user/{userId}/contact")
    public ResponseEntity<UserContact> updateUserContact(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request) {
        try {
            UserContact contact = userContactRepository.findByUserId(userId)
                    .orElse(new UserContact());

            contact.setUserId(userId);
            
            if (request.containsKey("phoneNumber")) {
                contact.setPhoneNumber((String) request.get("phoneNumber"));
            }
            if (request.containsKey("email")) {
                contact.setEmail((String) request.get("email"));
            }
            if (request.containsKey("smsNotificationsEnabled")) {
                contact.setSmsNotificationsEnabled((Boolean) request.get("smsNotificationsEnabled"));
            }
            if (request.containsKey("emailNotificationsEnabled")) {
                contact.setEmailNotificationsEnabled((Boolean) request.get("emailNotificationsEnabled"));
            }

            UserContact saved = userContactRepository.save(contact);
            return new ResponseEntity<>(saved, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtenir les préférences de contact d'un utilisateur
     * GET /api/sms/user/{userId}/contact
     */
    @GetMapping("/user/{userId}/contact")
    public ResponseEntity<UserContact> getUserContact(@PathVariable Long userId) {
        try {
            UserContact contact = userContactRepository.findByUserId(userId)
                    .orElse(null);
            return new ResponseEntity<>(contact, contact != null ? HttpStatus.OK : HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Envoyer un SMS direct à un numéro (pour félicitations équipe gagnante)
     * POST /api/sms/send-direct
     */
    @PostMapping("/send-direct")
    public ResponseEntity<Map<String, Object>> sendDirectSms(@RequestBody Map<String, Object> request) {
        try {
            String phoneNumber = (String) request.get("phoneNumber");
            String message = (String) request.get("message");
            Long teamId = request.get("teamId") != null ? Long.parseLong(request.get("teamId").toString()) : null;
            Long competitionId = request.get("competitionId") != null ? Long.parseLong(request.get("competitionId").toString()) : null;

            SmsLog smsLog = smsService.sendSmsToPhone(null, phoneNumber, message, "CONGRATULATION", competitionId, null);

            Map<String, Object> response = new HashMap<>();
            response.put("success", "SENT".equals(smsLog.getStatus()));
            response.put("smsLog", smsLog);
            response.put("message", "SENT".equals(smsLog.getStatus()) ? 
                "SMS envoyé avec succès!" : "Échec: " + smsLog.getErrorMessage());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
