package com.esprit.examen.utils;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class GitHubUrlExtractor {

    private static final Pattern GITHUB_URL_PATTERN = Pattern.compile(
            "(?i)https?://(?:www\\.)?github\\.com/[^\\s)\\]}>,\"']+"
    );

    private static final Pattern OWNER_REPO_TOKEN = Pattern.compile("^[A-Za-z0-9_.-]+$");

    private GitHubUrlExtractor() {
    }

    public static List<OwnerRepoReference> extractOwnerRepoPairs(String content) {
        if (content == null || content.isBlank()) {
            return List.of();
        }

        Matcher matcher = GITHUB_URL_PATTERN.matcher(content);
        Map<String, OwnerRepoReference> uniqueByKey = new LinkedHashMap<>();

        while (matcher.find()) {
            String candidate = sanitizeTrailingPunctuation(matcher.group());
            Optional<OwnerRepoReference> parsed = parseOwnerRepo(candidate);
            parsed.ifPresent(reference -> uniqueByKey.putIfAbsent(reference.cacheKey(), reference));
        }

        return new ArrayList<>(uniqueByKey.values());
    }

    public static Optional<OwnerRepoReference> extractFirstOwnerRepo(String content) {
        List<OwnerRepoReference> all = extractOwnerRepoPairs(content);
        if (all.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(all.get(0));
    }

    private static Optional<OwnerRepoReference> parseOwnerRepo(String url) {
        try {
            URI uri = URI.create(url);
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                return Optional.empty();
            }

            String[] segments = path.split("/");
            List<String> nonBlank = new ArrayList<>();
            for (String segment : segments) {
                if (!segment.isBlank()) {
                    nonBlank.add(segment);
                }
            }

            if (nonBlank.size() < 2) {
                return Optional.empty();
            }

            String owner = nonBlank.get(0).trim();
            String repo = trimGitSuffix(nonBlank.get(1).trim());

            if (!isValidToken(owner) || !isValidToken(repo)) {
                return Optional.empty();
            }

            return Optional.of(new OwnerRepoReference(owner, repo, url));
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    private static String sanitizeTrailingPunctuation(String value) {
        int end = value.length();
        while (end > 0) {
            char current = value.charAt(end - 1);
            if (current == '.' || current == ',' || current == ';' || current == ':' || current == ')' || current == ']') {
                end -= 1;
                continue;
            }
            break;
        }

        return value.substring(0, end);
    }

    private static String trimGitSuffix(String repo) {
        if (repo.toLowerCase(Locale.ROOT).endsWith(".git")) {
            return repo.substring(0, repo.length() - 4);
        }

        return repo;
    }

    private static boolean isValidToken(String token) {
        return token != null && !token.isBlank() && OWNER_REPO_TOKEN.matcher(token).matches();
    }

    public record OwnerRepoReference(String owner, String repo, String sourceUrl) {
        public String cacheKey() {
            return (owner + "/" + repo).toLowerCase(Locale.ROOT);
        }
    }
}
