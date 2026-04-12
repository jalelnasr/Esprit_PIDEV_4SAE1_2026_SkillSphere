package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedUserDTO {
    private Long userId;
    private String displayName;
    private int score;
    private int sharedGroups;
    private int sharedHashtags;
    private int sharedInteractions;
    private boolean sameDomain;
}
