package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.NotificationRequest;
import org.example.b2bmodule.dto.NotificationResponse;
import org.example.b2bmodule.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/b2b/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Gestion des notifications utilisateur")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Créer une notification manuelle (pour tests ou admin)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer une notification")
    public NotificationResponse create(@RequestBody NotificationRequest req) {
        return notificationService.create(req);
    }

    /**
     * Obtenir toutes les notifications d'un utilisateur
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Obtenir toutes les notifications d'un utilisateur")
    public List<NotificationResponse> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getUserNotifications(userId);
    }

    /**
     * Obtenir les notifications non lues d'un utilisateur
     */
    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "Obtenir les notifications non lues")
    public List<NotificationResponse> getUnreadNotifications(@PathVariable Long userId) {
        return notificationService.getUnreadNotifications(userId);
    }

    /**
     * Obtenir le nombre de notifications non lues
     */
    @GetMapping("/user/{userId}/unread-count")
    @Operation(summary = "Compter les notifications non lues")
    public Integer getUnreadCount(@PathVariable Long userId) {
        return notificationService.getUnreadCount(userId);
    }

    /**
     * Obtenir les notifications récentes (24h)
     */
    @GetMapping("/user/{userId}/recent")
    @Operation(summary = "Obtenir les notifications récentes (24h)")
    public List<NotificationResponse> getRecentNotifications(@PathVariable Long userId) {
        return notificationService.getRecentNotifications(userId);
    }

    /**
     * Marquer une notification comme lue
     */
    @PutMapping("/{id}/read")
    @Operation(summary = "Marquer une notification comme lue")
    public NotificationResponse markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    @PutMapping("/user/{userId}/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Marquer toutes les notifications comme lues")
    public void markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
    }

    /**
     * Supprimer une notification
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprimer une notification")
    public void delete(@PathVariable Long id) {
        notificationService.delete(id);
    }

    /**
     * Supprimer toutes les notifications d'un utilisateur
     */
    @DeleteMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprimer toutes les notifications d'un utilisateur")
    public void deleteAllUserNotifications(@PathVariable Long userId) {
        notificationService.deleteAllUserNotifications(userId);
    }

    /**
     * Créer des notifications de test pour un utilisateur
     */
    @PostMapping("/user/{userId}/create-test-notifications")
    @Operation(summary = "Créer des notifications de test")
    public List<NotificationResponse> createTestNotifications(@PathVariable Long userId) {
        return notificationService.createTestNotifications(userId);
    }
}
