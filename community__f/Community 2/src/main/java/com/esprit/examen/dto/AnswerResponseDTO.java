package com.esprit.examen.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AnswerResponseDTO {

    private Long answerId;
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
    private Long questionId;
    private List<GitHubRepoPreviewDTO> githubPreviews;

    public AnswerResponseDTO() {
    }

    public AnswerResponseDTO(
            Long answerId,
            String content,
            LocalDateTime createdAt,
            Long userId,
            Long questionId,
            List<GitHubRepoPreviewDTO> githubPreviews
    ) {
        this.answerId = answerId;
        this.content = content;
        this.createdAt = createdAt;
        this.userId = userId;
        this.questionId = questionId;
        this.githubPreviews = githubPreviews;
    }

    public Long getAnswerId() {
        return answerId;
    }

    public void setAnswerId(Long answerId) {
        this.answerId = answerId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public List<GitHubRepoPreviewDTO> getGithubPreviews() {
        return githubPreviews;
    }

    public void setGithubPreviews(List<GitHubRepoPreviewDTO> githubPreviews) {
        this.githubPreviews = githubPreviews;
    }
}
