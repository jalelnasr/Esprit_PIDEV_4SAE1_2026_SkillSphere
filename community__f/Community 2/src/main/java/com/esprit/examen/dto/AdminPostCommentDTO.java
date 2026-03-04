package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPostCommentDTO {
    private Long commentId;
    private String content;
    private Long userId;
    private LocalDateTime createdAt;
    private long likesCount;
}
