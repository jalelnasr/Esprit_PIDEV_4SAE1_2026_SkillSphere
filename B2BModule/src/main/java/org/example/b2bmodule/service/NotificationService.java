package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.b2bmodule.dto.NotificationRequest;
import org.example.b2bmodule.dto.NotificationResponse;
import org.example.b2bmodule.entity.Notification;
import org.example.b2bmodule.exception.ResourceNotFoundException;
import org.example.b2bmodule.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Créer une notification
     */
    @Transactional
    public NotificationResponse create(NotificationRequest req) {
        log.info("📢 Creating notification for user {}: {}", req.userId(), req.title());
        
        Notification notification = Notification.builder()
                .userId(req.userId())
                .type(req.type())
                .title(req.title())
                .message(req.message())
                .link(req.link())
                .relatedEntityId(req.relatedEntityId())
                .relatedEntityType(req.relatedEntityType())
                .priority(req.priority() != null ? req.priority() : "NORMAL")
                .icon(req.icon())
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);
        log.info("✅ Notification created with ID: {}", notification.getId());
        
        return toResponse(notification);
    }

    /**
     * Obtenir toutes les notifications d'un utilisateur
     */
    public List<NotificationResponse> getUserNotifications(Long userId) {
        log.info("📋 Getting all notifications for user {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtenir les notifications non lues d'un utilisateur
     */
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        log.info("📋 Getting unread notifications for user {}", userId);
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Compter les notifications non lues
     */
    public Integer getUnreadCount(Long userId) {
        Integer count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        log.info("🔢 User {} has {} unread notifications", userId, count);
        return count;
    }

    /**
     * Marquer une notification comme lue
     */
    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        log.info("✅ Marking notification {} as read", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        log.info("✅ Marking all notifications as read for user {}", userId);
        notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    /**
     * Supprimer une notification
     */
    @Transactional
    public void delete(Long notificationId) {
        log.info("🗑️ Deleting notification {}", notificationId);
        
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification not found with id: " + notificationId);
        }
        
        notificationRepository.deleteById(notificationId);
    }

    /**
     * Supprimer toutes les notifications d'un utilisateur
     */
    @Transactional
    public void deleteAllUserNotifications(Long userId) {
        log.info("🗑️ Deleting all notifications for user {}", userId);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);
    }

    /**
     * Obtenir les notifications récentes (dernières 24h)
     */
    public List<NotificationResponse> getRecentNotifications(Long userId) {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return notificationRepository.findRecentNotifications(userId, since)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Nettoyer les anciennes notifications (plus de 30 jours)
     */
    @Transactional
    public void cleanOldNotifications() {
        log.info("🧹 Cleaning old notifications (older than 30 days)");
        LocalDateTime before = LocalDateTime.now().minusDays(30);
        notificationRepository.deleteOldNotifications(before);
    }

    // ========== Méthodes Helper pour créer des notifications spécifiques ==========

    /**
     * Notifier une nouvelle candidature pour une entreprise
     * La notification sera visible par tous les RH de cette entreprise
     */
    public void notifyNewApplicationForCompany(Long companyId, String candidateName, String missionTitle, Long missionId) {
        // Créer une notification avec company_id au lieu de user_id spécifique
        // Le frontend filtrera les notifications par company_id du RH connecté
        create(new NotificationRequest(
                companyId,  // On utilise company_id comme userId temporairement
                "NEW_APPLICATION",
                "Nouvelle candidature",
                candidateName + " a postulé à la mission \"" + missionTitle + "\"",
                "/corporate/missions/" + missionId,
                missionId,
                "Mission",
                "NORMAL",
                "📋"
        ));
    }

    /**
     * Notifier une nouvelle candidature
     */
    public void notifyNewApplication(Long rhUserId, String candidateName, String missionTitle, Long missionId) {
        create(new NotificationRequest(
                rhUserId,
                "NEW_APPLICATION",
                "Nouvelle candidature",
                candidateName + " a postulé à la mission \"" + missionTitle + "\"",
                "/corporate/missions/" + missionId,
                missionId,
                "Mission",
                "NORMAL",
                "📋"
        ));
    }

    /**
     * Notifier l'acceptation d'une candidature
     */
    public void notifyApplicationAccepted(Long candidateUserId, String missionTitle, String companyName, Long missionId) {
        create(new NotificationRequest(
                candidateUserId,
                "APPLICATION_ACCEPTED",
                "Candidature acceptée !",
                "Félicitations ! Votre candidature pour \"" + missionTitle + "\" chez " + companyName + " a été acceptée.",
                "/my-applications",
                missionId,
                "Mission",
                "HIGH",
                "🎉"
        ));
    }

    /**
     * Notifier le rejet d'une candidature
     */
    public void notifyApplicationRejected(Long candidateUserId, String missionTitle, Long missionId) {
        create(new NotificationRequest(
                candidateUserId,
                "APPLICATION_REJECTED",
                "Candidature non retenue",
                "Votre candidature pour \"" + missionTitle + "\" n'a pas été retenue cette fois-ci.",
                "/my-applications",
                missionId,
                "Mission",
                "NORMAL",
                "❌"
        ));
    }

    /**
     * Notifier un nouveau contrat
     */
    public void notifyNewContract(Long candidateUserId, String missionTitle, Long contractId) {
        create(new NotificationRequest(
                candidateUserId,
                "NEW_CONTRACT",
                "Nouveau contrat disponible",
                "Un contrat a été créé pour la mission \"" + missionTitle + "\". Consultez les détails.",
                "/my-applications",
                contractId,
                "Contract",
                "HIGH",
                "📄"
        ));
    }

    /**
     * Notifier une nouvelle mission correspondant au profil
     */
    public void notifyMatchingMission(Long candidateUserId, String missionTitle, Long missionId) {
        create(new NotificationRequest(
                candidateUserId,
                "MATCHING_MISSION",
                "Nouvelle mission pour vous",
                "Une nouvelle mission \"" + missionTitle + "\" correspond à votre profil !",
                "/freelance/" + missionId,
                missionId,
                "Mission",
                "NORMAL",
                "🎯"
        ));
    }

    /**
     * Notifier un paiement reçu
     */
    public void notifyPaymentReceived(Long candidateUserId, Double amount, Long contractId) {
        create(new NotificationRequest(
                candidateUserId,
                "PAYMENT_RECEIVED",
                "Paiement reçu",
                "Vous avez reçu un paiement de " + amount + " TND.",
                "/my-contracts",
                contractId,
                "Payment",
                "HIGH",
                "💰"
        ));
    }

    /**
     * Créer des notifications de test pour un utilisateur
     */
    @Transactional
    public List<NotificationResponse> createTestNotifications(Long userId) {
        log.info("🧪 Creating test notifications for user {}", userId);
        
        // Créer 5 notifications de test variées
        create(new NotificationRequest(
                userId,
                "NEW_APPLICATION",
                "Nouvelle candidature reçue",
                "Jean Dupont a postulé à votre mission \"Développeur Full Stack\"",
                "/corporate/missions/1",
                1L,
                "Mission",
                "NORMAL",
                "📋"
        ));
        
        create(new NotificationRequest(
                userId,
                "NEW_APPLICATION",
                "Candidature urgente",
                "Marie Martin a postulé à votre mission \"Chef de Projet\"",
                "/corporate/missions/2",
                2L,
                "Mission",
                "HIGH",
                "📋"
        ));
        
        create(new NotificationRequest(
                userId,
                "SYSTEM",
                "Bienvenue sur SkillSphere !",
                "Votre système de notifications est maintenant actif. Vous recevrez des alertes pour toutes les activités importantes.",
                "/corporate/dashboard",
                null,
                null,
                "HIGH",
                "🎉"
        ));
        
        create(new NotificationRequest(
                userId,
                "NEW_CONTRACT",
                "Nouveau contrat signé",
                "Le contrat pour la mission \"Développeur Backend\" a été signé par le candidat.",
                "/corporate/contracts/1",
                1L,
                "Contract",
                "NORMAL",
                "📄"
        ));
        
        create(new NotificationRequest(
                userId,
                "SYSTEM",
                "Rappel: Missions en attente",
                "Vous avez 3 candidatures en attente de validation.",
                "/corporate/missions",
                null,
                null,
                "NORMAL",
                "⏰"
        ));
        
        log.info("✅ Created 5 test notifications for user {}", userId);
        
        return getUserNotifications(userId);
    }

    // ========== Mapper ==========

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getLink(),
                notification.getRelatedEntityId(),
                notification.getRelatedEntityType(),
                notification.getIsRead(),
                notification.getCreatedAt(),
                notification.getReadAt(),
                notification.getPriority(),
                notification.getIcon()
        );
    }
}
