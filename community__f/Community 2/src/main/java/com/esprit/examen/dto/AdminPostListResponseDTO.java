package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPostListResponseDTO {
    private List<AdminPostSummaryDTO> posts;
    private long total;
    private int page;
    private int size;
}
