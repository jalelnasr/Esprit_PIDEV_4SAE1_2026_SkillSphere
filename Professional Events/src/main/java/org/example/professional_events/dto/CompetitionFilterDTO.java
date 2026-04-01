package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompetitionFilterDTO {
    private String searchTerm; // Recherche dans titre et description
    private String type; // HACKATHON, CODING_CHALLENGE, etc.
    private String status; // DRAFT, OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    private String participationType; // INDIVIDUAL, TEAM
    private LocalDateTime startDateFrom;
    private LocalDateTime startDateTo;
    private LocalDateTime endDateFrom;
    private LocalDateTime endDateTo;
    private Integer minParticipants;
    private Integer maxParticipants;
    private String sortBy; // title, startDate, endDate, participantCount
    private String sortDirection; // ASC, DESC
}
