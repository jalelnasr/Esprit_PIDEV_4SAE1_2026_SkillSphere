package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupJoinResponseDTO {
    private Long groupId;
    private Long userId;
    private boolean joined;
    private String role;
    private LocalDateTime joinedAt;
    private String message;
}
