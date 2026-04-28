package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Trouver toutes les notifications d'un utilisateur, triées par date (plus récentes en premier)
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Trouver les notifications non lues d'un utilisateur
     */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    /**
     * Compter les notifications non lues d'un utilisateur
     */
    Integer countByUserIdAndIsReadFalse(Long userId);

    /**
     * Trouver les notifications par type
     */
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, String type);

    /**
     * Trouver les notifications récentes (dernières 24h)
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(Long userId, LocalDateTime since);

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsRead(Long userId, LocalDateTime readAt);

    /**
     * Supprimer les anciennes notifications (plus de X jours)
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :before")
    void deleteOldNotifications(LocalDateTime before);

    /**
     * Trouver les notifications par entité liée
     */
    List<Notification> findByRelatedEntityTypeAndRelatedEntityId(String entityType, Long entityId);
}
