package com.esprit.examen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPostSummaryDTO {
    private Long postId;
    private String content;
    private String imageUrl;
    private String videoUrl;
    private Long userId;
    private Long groupId;
    private LocalDateTime createdAt;
    private long likesCount;
    private long commentsCount;
}
