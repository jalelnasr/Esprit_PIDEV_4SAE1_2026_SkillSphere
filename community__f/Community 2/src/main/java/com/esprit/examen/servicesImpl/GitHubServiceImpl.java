package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.GitHubRepoPreviewDTO;
import com.esprit.examen.services.GitHubService;
import com.esprit.examen.utils.GitHubUrlExtractor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Service
public class GitHubServiceImpl implements GitHubService {

    private static final Duration CACHE_TTL = Duration.ofHours(24);
    private static final String STATUS_OK = "OK";
    private static final String STATUS_INVALID = "INVALID_URL";
    private static final String STATUS_NOT_FOUND = "NOT_FOUND";
    private static final String STATUS_RATE_LIMITED = "RATE_LIMITED";
    private static final String STATUS_ERROR = "ERROR";

    private final ConcurrentMap<String, CachedPreview> cache = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public List<GitHubRepoPreviewDTO> resolvePreviewsFromContent(String content) {
        List<GitHubUrlExtractor.OwnerRepoReference> references = GitHubUrlExtractor.extractOwnerRepoPairs(content);
        if (references.isEmpty()) {
            return List.of();
        }

        return references.stream()
                .map(this::loadPreview)
                .collect(Collectors.toList());
    }

    @Override
    public GitHubRepoPreviewDTO previewFromContent(String content) {
        return GitHubUrlExtractor.extractFirstOwnerRepo(content)
                .map(this::loadPreview)
                .orElseGet(() -> invalidPreview("No valid GitHub repository URL found in answer content."));
    }

    private GitHubRepoPreviewDTO loadPreview(GitHubUrlExtractor.OwnerRepoReference reference) {
        String cacheKey = reference.cacheKey();
        Instant now = Instant.now();

        CachedPreview cached = cache.get(cacheKey);
        if (cached != null && now.isBefore(cached.expiresAt())) {
            return copy(cached.preview());
        }

        GitHubRepoPreviewDTO preview = fetchFromGitHub(reference.owner(), reference.repo());
        cache.put(cacheKey, new CachedPreview(copy(preview), now.plus(CACHE_TTL)));
        return preview;
    }

    private GitHubRepoPreviewDTO fetchFromGitHub(String owner, String repo) {
        String endpoint = "https://api.github.com/repos/" + owner + "/" + repo;

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Community-Service");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            );

            Map<?, ?> body = response.getBody();
            if (body == null) {
                return errorPreview(owner, repo, STATUS_ERROR, "GitHub response is empty.");
            }

            return successPreview(body, owner, repo);
        } catch (HttpStatusCodeException ex) {
            int status = ex.getStatusCode().value();
            if (status == 404) {
                return errorPreview(owner, repo, STATUS_NOT_FOUND, "Repository not found on GitHub.");
            }

            if (status == 403 && isRateLimited(ex)) {
                return errorPreview(owner, repo, STATUS_RATE_LIMITED, "GitHub API rate limit exceeded. Try again later.");
            }

            return errorPreview(owner, repo, STATUS_ERROR, "GitHub API error: HTTP " + status + ".");
        } catch (RestClientException ex) {
            return errorPreview(owner, repo, STATUS_ERROR, "Unable to reach GitHub API right now.");
        }
    }

    private GitHubRepoPreviewDTO successPreview(Map<?, ?> body, String fallbackOwner, String fallbackRepo) {
        Object ownerNode = body.get("owner");
        String owner = fallbackOwner;
        if (ownerNode instanceof Map<?, ?> ownerMap) {
            owner = asString(ownerMap.get("login"), fallbackOwner);
        }

        GitHubRepoPreviewDTO dto = new GitHubRepoPreviewDTO();
        dto.setRepoName(asString(body.get("name"), fallbackRepo));
        dto.setOwner(owner);
        dto.setDescription(asString(body.get("description"), "No description provided."));
        dto.setLanguage(asString(body.get("language"), "Unknown"));
        dto.setStars(asLong(body.get("stargazers_count")));
        dto.setForks(asLong(body.get("forks_count")));
        dto.setUrl(asString(body.get("html_url"), "https://github.com/" + owner + "/" + fallbackRepo));
        dto.setStatus(STATUS_OK);
        dto.setMessage(null);
        return dto;
    }

    private GitHubRepoPreviewDTO invalidPreview(String message) {
        GitHubRepoPreviewDTO dto = new GitHubRepoPreviewDTO();
        dto.setRepoName("");
        dto.setOwner("");
        dto.setDescription("");
        dto.setLanguage("Unknown");
        dto.setStars(0);
        dto.setForks(0);
        dto.setUrl("");
        dto.setStatus(STATUS_INVALID);
        dto.setMessage(message);
        return dto;
    }

    private GitHubRepoPreviewDTO errorPreview(String owner, String repo, String status, String message) {
        GitHubRepoPreviewDTO dto = new GitHubRepoPreviewDTO();
        dto.setRepoName(repo);
        dto.setOwner(owner);
        dto.setDescription("");
        dto.setLanguage("Unknown");
        dto.setStars(0);
        dto.setForks(0);
        dto.setUrl("https://github.com/" + owner + "/" + repo);
        dto.setStatus(status);
        dto.setMessage(message);
        return dto;
    }

    private GitHubRepoPreviewDTO copy(GitHubRepoPreviewDTO source) {
        return new GitHubRepoPreviewDTO(
                source.getRepoName(),
                source.getOwner(),
                source.getDescription(),
                source.getLanguage(),
                source.getStars(),
                source.getForks(),
                source.getUrl(),
                source.getStatus(),
                source.getMessage()
        );
    }

    private boolean isRateLimited(HttpStatusCodeException ex) {
        String remaining = ex.getResponseHeaders() != null ? ex.getResponseHeaders().getFirst("X-RateLimit-Remaining") : null;
        if (remaining != null && remaining.trim().equals("0")) {
            return true;
        }

        String body = ex.getResponseBodyAsString();
        return body != null && body.toLowerCase(Locale.ROOT).contains("rate limit");
    }

    private String asString(Object value, String fallback) {
        if (value == null) {
            return fallback;
        }

        String normalized = String.valueOf(value).trim();
        return normalized.isEmpty() ? fallback : normalized;
    }

    private long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }

        if (value instanceof String text) {
            try {
                return Long.parseLong(text.trim());
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }

        return 0;
    }

    private record CachedPreview(GitHubRepoPreviewDTO preview, Instant expiresAt) {
    }
}
