package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.GitHubRepoPreviewDTO;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GitHubServiceImplTest {

    private final GitHubServiceImpl gitHubService = new GitHubServiceImpl();

    @Test
    void previewFromContent_returnsInvalidWhenNoGitHubUrlExists() {
        GitHubRepoPreviewDTO preview = gitHubService.previewFromContent("No links here");

        assertEquals("INVALID_URL", preview.getStatus());
        assertTrue(preview.getMessage().contains("No valid GitHub repository URL"));
    }

    @Test
    void resolvePreviewsFromContent_returnsEmptyWhenNoReferences() {
        List<GitHubRepoPreviewDTO> previews = gitHubService.resolvePreviewsFromContent("Nothing to parse");

        assertTrue(previews.isEmpty());
    }
}
