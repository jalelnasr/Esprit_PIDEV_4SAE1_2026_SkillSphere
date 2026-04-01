package com.esprit.examen.services;

import com.esprit.examen.dto.GitHubRepoPreviewDTO;

import java.util.List;

public interface GitHubService {
    List<GitHubRepoPreviewDTO> resolvePreviewsFromContent(String content);
    GitHubRepoPreviewDTO previewFromContent(String content);
}
