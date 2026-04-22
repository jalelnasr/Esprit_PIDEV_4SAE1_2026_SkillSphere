package org.example.professional_events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStatsDTO {
    private String month; // Format: "2026-03"
    private Long competitions;
    private Long participants;
    private Long messages;
}
