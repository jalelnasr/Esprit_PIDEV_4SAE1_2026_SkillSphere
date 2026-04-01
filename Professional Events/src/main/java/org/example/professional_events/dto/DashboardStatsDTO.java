package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    // Statistiques générales
    private Long totalCompetitions;
    private Long activeCompetitions;
    private Long completedCompetitions;
    private Long totalParticipants;
    private Long totalTeams;
    private Long totalMessages;
    private Long totalNotifications;
    
    // Taux de participation
    private Double participationRate;
    private Long totalRegistrations;
    
    // Statistiques par type de compétition
    private Map<String, Long> competitionsByType;
    
    // Statistiques par statut
    private Map<String, Long> competitionsByStatus;
    
    // Évolution mensuelle (pour graphiques)
    private List<MonthlyStatsDTO> monthlyStats;
    
    // Top 5 compétitions par participants
    private List<CompetitionStatsDTO> topCompetitions;
    
    // Statistiques de messages par compétition
    private List<CompetitionMessageStatsDTO> messageStats;
}
