package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {
    private Long leaderboardId;
    private Long competitionId;
    private Long userId;
    private Long teamId;
    private Integer rank;
    private Integer score;
    private LocalDateTime lastUpdated;
    
    // Informations supplémentaires
    private String participantName;  // Nom de l'équipe ou de l'utilisateur
    private List<String> teamMembers; // Noms des membres de l'équipe
}
