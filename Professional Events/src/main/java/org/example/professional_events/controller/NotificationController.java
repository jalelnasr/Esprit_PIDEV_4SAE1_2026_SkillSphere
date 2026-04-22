package org.example.professional_events.controller;

import org.example.professional_events.dto.NotificationDTO;
import org.example.professional_events.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Récupérer toutes les notifications d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // Récupérer les notifications non lues
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    // Compter les notifications non lues
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Map<String, Long>> countUnreadNotifications(@PathVariable Long userId) {
        Long count = notificationService.countUnreadNotifications(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Marquer une notification comme lue
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    // Marquer toutes les notifications comme lues
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // Supprimer une notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    // Envoyer une annonce manuelle (FORMATEUR uniquement)
    @PostMapping("/announcement")
    public ResponseEntity<Void> sendAnnouncement(@RequestBody Map<String, Object> request) {
        Long competitionId = request.get("competitionId") != null ? 
            Long.valueOf(request.get("competitionId").toString()) : null;
        String title = (String) request.get("title");
        String message = (String) request.get("message");
        @SuppressWarnings("unchecked")
        List<Long> userIds = (List<Long>) request.get("userIds");
        
        notificationService.sendAnnouncementToCompetition(competitionId, title, message, userIds);
        return ResponseEntity.ok().build();
    }
}
