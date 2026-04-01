package com.esprit.examen.dto;

public class GitHubRepoPreviewDTO {

    private String repoName;
    private String owner;
    private String description;
    private String language;
    private long stars;
    private long forks;
    private String url;
    private String status;
    private String message;

    public GitHubRepoPreviewDTO() {
    }

    public GitHubRepoPreviewDTO(
            String repoName,
            String owner,
            String description,
            String language,
            long stars,
            long forks,
            String url,
            String status,
            String message
    ) {
        this.repoName = repoName;
        this.owner = owner;
        this.description = description;
        this.language = language;
        this.stars = stars;
        this.forks = forks;
        this.url = url;
        this.status = status;
        this.message = message;
    }

    public String getRepoName() {
        return repoName;
    }

    public void setRepoName(String repoName) {
        this.repoName = repoName;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public long getStars() {
        return stars;
    }

    public void setStars(long stars) {
        this.stars = stars;
    }

    public long getForks() {
        return forks;
    }

    public void setForks(long forks) {
        this.forks = forks;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
