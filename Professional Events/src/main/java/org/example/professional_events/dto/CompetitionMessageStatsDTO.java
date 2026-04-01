package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompetitionMessageStatsDTO {
    private Long competitionId;
    private String competitionTitle;
    private Long messageCount;
    private Long uniqueParticipants;
}
