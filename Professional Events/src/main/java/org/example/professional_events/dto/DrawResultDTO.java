package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DrawResultDTO {
    private Long drawId;
    private Long competitionId;
    private Integer qualifiedTeamsCount;
    private Integer matchesCreated;
    private LocalDateTime drawDate;
    private List<MatchDTO> matches;
}
