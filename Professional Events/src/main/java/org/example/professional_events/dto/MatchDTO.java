package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchDTO {
    private Long matchId;
    private Long competitionId;
    private Integer matchNumber;
    
    // Team 1
    private Long team1Id;
    private String team1Name;
    private Integer team1Members;
    
    // Team 2
    private Long team2Id;
    private String team2Name;
    private Integer team2Members;
    
    // Winner
    private Long winnerTeamId;
    private String winnerTeamName;
    
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime playedAt;
    private String notes;
}
