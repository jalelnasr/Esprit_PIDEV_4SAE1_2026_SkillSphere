package org.example.professional_events.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "competitions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long competitionId;

    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private CompetitionType type;

    @Enumerated(EnumType.STRING)
    private ParticipationType participationType;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    private Integer maxParticipants;

    @Enumerated(EnumType.STRING)
    private CompetitionStatus status;

    // TEAM settings (optionnels)
    private Integer numberOfTeams;
    private Integer participantsPerTeam;
    private Integer minTeamSize;
    private Integer maxTeamSize;

    // Qui a créé (formateur)
    private Long createdBy;

    // Date de création
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Draw and winner fields
    @Column(name = "draw_completed")
    private Boolean drawCompleted = false;

    @Column(name = "draw_date")
    private LocalDateTime drawDate;

    @Column(name = "winner_team_id")
    private Long winnerTeamId;

    @Column(name = "winner_declared_at")
    private LocalDateTime winnerDeclaredAt;

    // ========== LOCATION FIELDS ==========
    @Column(name = "location_name")
    private String locationName;  // Ex: "Esprit School, Tunis"

    @Column(name = "location_address")
    private String locationAddress;  // Ex: "2 Rue de l'Esprit, Ariana"

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // ========== ENUMS ==========
    
    public enum CompetitionType { ONLINE, PHYSICAL, HYBRID }
    public enum CompetitionStatus { OPEN, CLOSED, IN_PROGRESS, COMPLETED, CANCELLED }
    public enum ParticipationType { INDIVIDUAL, TEAM, BOTH }
}