package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberDTO {
    private Long id;

    // ✅ nécessaires pour afficher + quitter le groupe
    private Long teamId;
    private String teamName;

    private Long userId;
    private String userName;
    private LocalDateTime joinedAt;
}