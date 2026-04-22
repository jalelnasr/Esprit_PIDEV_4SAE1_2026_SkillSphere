package org.example.professional_events.service;

import org.example.professional_events.dto.NotificationDTO;
import org.example.professional_events.entity.Notification;
import org.example.professional_events.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Envoyer une notification à un utilisateur
    public NotificationDTO sendNotification(Long userId, String type, String title, String message, 
                                           Long competitionId, Long relatedId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setCompetitionId(competitionId);
        notification.setRelatedId(relatedId);
        
        notification = notificationRepository.save(notification);
        
        // Envoyer via WebSocket en temps réel
        NotificationDTO dto = convertToDTO(notification);
        messagingTemplate.convertAndSendToUser(
            userId.toString(), 
            "/queue/notifications", 
            dto
        );
        
        return dto;
    }

    // Envoyer une annonce à tous les participants d'une compétition
    public void sendAnnouncementToCompetition(Long competitionId, String title, String message, List<Long> userIds) {
        for (Long userId : userIds) {
            sendNotification(userId, "ANNOUNCEMENT", title, message, competitionId, null);
        }
    }

    // Récupérer toutes les notifications d'un utilisateur
    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Récupérer les notifications non lues
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Compter les notifications non lues
    public Long countUnreadNotifications(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    // Marquer une notification comme lue
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    // Marquer toutes les notifications comme lues
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    // Supprimer une notification
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // Convertir entité en DTO
    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
            notification.getIdNotification(),
            notification.getUserId(),
            notification.getType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getIsRead(),
            notification.getCreatedAt(),
            notification.getCompetitionId(),
            notification.getRelatedId()
        );
    }
}
