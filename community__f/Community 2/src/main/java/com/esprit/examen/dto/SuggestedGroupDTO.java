package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedGroupDTO {
    private Long groupId;
    private String name;
    private String description;
    private int score;
    private int matchedHashtags;
    private int overlapMembers;
    private int recentActivity;
    private long membersCount;
    private boolean trending;
    private boolean popular;
}
