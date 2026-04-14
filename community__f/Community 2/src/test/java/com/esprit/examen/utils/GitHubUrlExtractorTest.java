package com.esprit.examen.utils;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GitHubUrlExtractorTest {

    @Test
    void extractOwnerRepoPairs_returnsEmptyForBlankContent() {
        assertTrue(GitHubUrlExtractor.extractOwnerRepoPairs(null).isEmpty());
        assertTrue(GitHubUrlExtractor.extractOwnerRepoPairs("   ").isEmpty());
    }

    @Test
    void extractOwnerRepoPairs_extractsUniqueRepositoriesAndSanitizesUrls() {
        String content = "Refs: https://github.com/OpenAI/gym, and https://github.com/openai/gym.git and "
            + "https://github.com/spring-projects/spring-boot).";

        List<GitHubUrlExtractor.OwnerRepoReference> references = GitHubUrlExtractor.extractOwnerRepoPairs(content);

        assertEquals(2, references.size());
        assertEquals("openai/gym", references.get(0).cacheKey());
        assertEquals("spring-projects/spring-boot", references.get(1).cacheKey());
    }

    @Test
    void extractFirstOwnerRepo_returnsFirstValidReference() {
        String content = "bad https://example.com/repo and valid https://github.com/org/repo";

        Optional<GitHubUrlExtractor.OwnerRepoReference> reference = GitHubUrlExtractor.extractFirstOwnerRepo(content);

        assertTrue(reference.isPresent());
        assertEquals("org/repo", reference.get().cacheKey());
    }
}
