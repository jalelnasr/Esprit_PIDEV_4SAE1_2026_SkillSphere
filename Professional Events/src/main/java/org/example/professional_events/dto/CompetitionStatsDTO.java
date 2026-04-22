package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompetitionStatsDTO {
    private Long competitionId;
    private String title;
    private String type;
    private String status;
    private Long participantCount;
    private Long teamCount;
    private Long messageCount;
    private Integer maxParticipants;
    private Double fillRate; // Taux de remplissage
}
