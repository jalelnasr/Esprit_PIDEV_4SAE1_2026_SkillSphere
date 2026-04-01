package org.example.professional_events.service;

import org.example.professional_events.dto.*;
import org.example.professional_events.entity.Competition;
import org.example.professional_events.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Obtenir toutes les statistiques du dashboard
     */
    public DashboardStatsDTO getDashboardStats(Long userId) {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Statistiques générales
        stats.setTotalCompetitions(competitionRepository.countByCreatedBy(userId));
        stats.setActiveCompetitions(competitionRepository.countByCreatedByAndStatus(userId, Competition.CompetitionStatus.IN_PROGRESS));
        stats.setCompletedCompetitions(competitionRepository.countByCreatedByAndStatus(userId, Competition.CompetitionStatus.COMPLETED));
        
        // Compter tous les participants des compétitions du formateur
        List<Competition> userCompetitions = competitionRepository.findByCreatedBy(userId);
        List<Long> competitionIds = userCompetitions.stream()
                .map(Competition::getCompetitionId)
                .collect(Collectors.toList());
        
        if (!competitionIds.isEmpty()) {
            stats.setTotalParticipants(participantRepository.countByCompetitionIdIn(competitionIds));
            stats.setTotalTeams(teamRepository.countByCompetitionIdIn(competitionIds));
            stats.setTotalMessages(chatMessageRepository.countByCompetitionIdIn(competitionIds));
        } else {
            stats.setTotalParticipants(0L);
            stats.setTotalTeams(0L);
            stats.setTotalMessages(0L);
        }
        
        stats.setTotalNotifications(notificationRepository.count());

        // Taux de participation
        Long totalRegistrations = stats.getTotalParticipants();
        Long totalCapacity = userCompetitions.stream()
                .mapToLong(c -> c.getMaxParticipants() != null ? c.getMaxParticipants() : 0)
                .sum();
        stats.setTotalRegistrations(totalRegistrations);
        stats.setParticipationRate(totalCapacity > 0 ? (totalRegistrations * 100.0 / totalCapacity) : 0.0);

        // Statistiques par type
        Map<String, Long> byType = new HashMap<>();
        for (Competition comp : userCompetitions) {
            String type = comp.getType() != null ? comp.getType().toString() : "UNKNOWN";
            byType.put(type, byType.getOrDefault(type, 0L) + 1);
        }
        stats.setCompetitionsByType(byType);

        // Statistiques par statut
        Map<String, Long> byStatus = new HashMap<>();
        for (Competition comp : userCompetitions) {
            String status = comp.getStatus() != null ? comp.getStatus().toString() : "UNKNOWN";
            byStatus.put(status, byStatus.getOrDefault(status, 0L) + 1);
        }
        stats.setCompetitionsByStatus(byStatus);

        // Évolution mensuelle (6 derniers mois)
        stats.setMonthlyStats(getMonthlyStats(userId));

        // Top 5 compétitions par participants
        stats.setTopCompetitions(getTopCompetitions(userId, 5));

        // Statistiques de messages
        stats.setMessageStats(getMessageStats(userId));

        return stats;
    }

    /**
     * Obtenir les statistiques mensuelles
     */
    private List<MonthlyStatsDTO> getMonthlyStats(Long userId) {
        List<MonthlyStatsDTO> monthlyStats = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
            String monthLabel = monthStart.format(formatter);

            Long competitions = competitionRepository.countByCreatedByAndCreatedAtBetween(userId, monthStart, monthEnd);
            Long participants = participantRepository.countByCreatedAtBetween(monthStart, monthEnd);
            Long messages = chatMessageRepository.countBySentAtBetween(monthStart, monthEnd);

            monthlyStats.add(new MonthlyStatsDTO(monthLabel, competitions, participants, messages));
        }

        return monthlyStats;
    }

    /**
     * Obtenir le top des compétitions par nombre de participants
     */
    private List<CompetitionStatsDTO> getTopCompetitions(Long userId, int limit) {
        List<Competition> competitions = competitionRepository.findByCreatedBy(userId);
        
        return competitions.stream()
                .map(comp -> {
                    Long participantCount = participantRepository.countByCompetitionId(comp.getCompetitionId());
                    Long teamCount = teamRepository.countByCompetitionId(comp.getCompetitionId());
                    Long messageCount = chatMessageRepository.countByCompetitionId(comp.getCompetitionId());
                    
                    Double fillRate = comp.getMaxParticipants() != null && comp.getMaxParticipants() > 0
                            ? (participantCount * 100.0 / comp.getMaxParticipants())
                            : 0.0;

                    return new CompetitionStatsDTO(
                            comp.getCompetitionId(),
                            comp.getTitle(),
                            comp.getType() != null ? comp.getType().toString() : "UNKNOWN",
                            comp.getStatus() != null ? comp.getStatus().toString() : "UNKNOWN",
                            participantCount,
                            teamCount,
                            messageCount,
                            comp.getMaxParticipants(),
                            fillRate
                    );
                })
                .sorted((a, b) -> Long.compare(b.getParticipantCount(), a.getParticipantCount()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Obtenir les statistiques de messages par compétition
     */
    private List<CompetitionMessageStatsDTO> getMessageStats(Long userId) {
        List<Competition> competitions = competitionRepository.findByCreatedBy(userId);
        
        return competitions.stream()
                .map(comp -> {
                    Long messageCount = chatMessageRepository.countByCompetitionId(comp.getCompetitionId());
                    Long uniqueParticipants = chatMessageRepository.countDistinctSendersByCompetitionId(comp.getCompetitionId());
                    
                    return new CompetitionMessageStatsDTO(
                            comp.getCompetitionId(),
                            comp.getTitle(),
                            messageCount,
                            uniqueParticipants
                    );
                })
                .filter(stat -> stat.getMessageCount() > 0)
                .sorted((a, b) -> Long.compare(b.getMessageCount(), a.getMessageCount()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Filtrer les compétitions selon les critères
     */
    public List<Competition> filterCompetitions(CompetitionFilterDTO filter, Long userId) {
        List<Competition> competitions = competitionRepository.findByCreatedBy(userId);

        // Appliquer les filtres
        return competitions.stream()
                .filter(comp -> filterBySearchTerm(comp, filter.getSearchTerm()))
                .filter(comp -> filterByType(comp, filter.getType()))
                .filter(comp -> filterByStatus(comp, filter.getStatus()))
                .filter(comp -> filterByParticipationType(comp, filter.getParticipationType()))
                .filter(comp -> filterByDateRange(comp, filter))
                .filter(comp -> filterByParticipantCount(comp, filter))
                .sorted(getComparator(filter.getSortBy(), filter.getSortDirection()))
                .collect(Collectors.toList());
    }

    /**
     * Recherche rapide par terme
     */
    public List<Competition> searchCompetitions(String searchTerm, Long userId) {
        List<Competition> competitions = competitionRepository.findByCreatedBy(userId);
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return competitions;
        }

        String term = searchTerm.toLowerCase();
        return competitions.stream()
                .filter(comp -> filterBySearchTerm(comp, term))
                .collect(Collectors.toList());
    }

    // ==================== FILTRES ====================

    private boolean filterBySearchTerm(Competition comp, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return true;
        }
        String term = searchTerm.toLowerCase();
        return (comp.getTitle() != null && comp.getTitle().toLowerCase().contains(term)) ||
               (comp.getDescription() != null && comp.getDescription().toLowerCase().contains(term));
    }

    private boolean filterByType(Competition comp, String type) {
        if (type == null || type.trim().isEmpty()) {
            return true;
        }
        return comp.getType() != null && comp.getType().toString().equalsIgnoreCase(type);
    }

    private boolean filterByStatus(Competition comp, String status) {
        if (status == null || status.trim().isEmpty()) {
            return true;
        }
        return comp.getStatus() != null && comp.getStatus().toString().equalsIgnoreCase(status);
    }

    private boolean filterByParticipationType(Competition comp, String participationType) {
        if (participationType == null || participationType.trim().isEmpty()) {
            return true;
        }
        return comp.getParticipationType() != null && 
               comp.getParticipationType().toString().equalsIgnoreCase(participationType);
    }

    private boolean filterByDateRange(Competition comp, CompetitionFilterDTO filter) {
        if (filter.getStartDateFrom() != null && comp.getStartDate() != null) {
            if (comp.getStartDate().isBefore(filter.getStartDateFrom())) {
                return false;
            }
        }
        if (filter.getStartDateTo() != null && comp.getStartDate() != null) {
            if (comp.getStartDate().isAfter(filter.getStartDateTo())) {
                return false;
            }
        }
        if (filter.getEndDateFrom() != null && comp.getEndDate() != null) {
            if (comp.getEndDate().isBefore(filter.getEndDateFrom())) {
                return false;
            }
        }
        if (filter.getEndDateTo() != null && comp.getEndDate() != null) {
            if (comp.getEndDate().isAfter(filter.getEndDateTo())) {
                return false;
            }
        }
        return true;
    }

    private boolean filterByParticipantCount(Competition comp, CompetitionFilterDTO filter) {
        Long participantCount = participantRepository.countByCompetitionId(comp.getCompetitionId());
        
        if (filter.getMinParticipants() != null && participantCount < filter.getMinParticipants()) {
            return false;
        }
        if (filter.getMaxParticipants() != null && participantCount > filter.getMaxParticipants()) {
            return false;
        }
        return true;
    }

    private Comparator<Competition> getComparator(String sortBy, String sortDirection) {
        boolean ascending = "ASC".equalsIgnoreCase(sortDirection);
        
        Comparator<Competition> comparator;
        
        if ("startDate".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(Competition::getStartDate, Comparator.nullsLast(Comparator.naturalOrder()));
        } else if ("endDate".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(Competition::getEndDate, Comparator.nullsLast(Comparator.naturalOrder()));
        } else if ("participantCount".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(comp -> 
                participantRepository.countByCompetitionId(comp.getCompetitionId())
            );
        } else {
            // Par défaut: tri par titre
            comparator = Comparator.comparing(Competition::getTitle, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        }
        
        return ascending ? comparator : comparator.reversed();
    }
}
