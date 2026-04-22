package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {
    private Long teamId;
    private String teamName;
    private Long competitionId;
    private Integer maxMembers;
    private Integer currentMembers;
    private boolean isFull;
    private List<TeamMemberDTO> members;
    
    // Qualification fields
    private Boolean isQualified;
    private String qualifiedAt;
    private Long qualifiedBy;
}
