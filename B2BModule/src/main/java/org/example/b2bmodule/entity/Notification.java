package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID de l'utilisateur qui reçoit la notification
     */
    @Column(nullable = false)
    private Long userId;

    /**
     * Type de notification (NEW_APPLICATION, APPLICATION_ACCEPTED, etc.)
     */
    @Column(nullable = false, length = 50)
    private String type;

    /**
     * Titre de la notification
     */
    @Column(nullable = false)
    private String title;

    /**
     * Message détaillé
     */
    @Column(columnDefinition = "TEXT")
    private String message;

    /**
     * Lien vers la ressource concernée (ex: /missions/123)
     */
    private String link;

    /**
     * ID de la ressource liée (mission, contrat, etc.)
     */
    private Long relatedEntityId;

    /**
     * Type de l'entité liée (Mission, Contract, Application, etc.)
     */
    private String relatedEntityType;

    /**
     * Notification lue ou non
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    /**
     * Date de création
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Date de lecture
     */
    private LocalDateTime readAt;

    /**
     * Priorité (LOW, NORMAL, HIGH, URGENT)
     */
    @Column(length = 20)
    @Builder.Default
    private String priority = "NORMAL";

    /**
     * Icône à afficher (emoji ou classe CSS)
     */
    private String icon;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
