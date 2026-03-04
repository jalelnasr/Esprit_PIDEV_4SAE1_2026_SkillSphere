package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPostDetailDTO {
    private AdminPostSummaryDTO post;
    private List<AdminPostLikeDTO> likes;
    private List<AdminPostCommentDTO> comments;
}
