package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPostLikeDTO {
    private Long postLikeId;
    private Long userId;
    private LocalDateTime createdAt;
}
