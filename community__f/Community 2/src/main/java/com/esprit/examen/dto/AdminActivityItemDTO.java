package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminActivityItemDTO {
    private String type;
    private String title;
    private String description;
    private Long userId;
    private Long entityId;
    private LocalDateTime createdAt;
}
