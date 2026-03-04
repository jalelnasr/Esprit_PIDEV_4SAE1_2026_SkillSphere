package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminCommunityStatsDTO {
    private int windowDays;
    private LocalDateTime generatedAt;
    private AdminMetricValueDTO posts;
    private AdminMetricValueDTO questions;
    private AdminMetricValueDTO groups;
    private AdminMetricValueDTO activeUsers;
}
