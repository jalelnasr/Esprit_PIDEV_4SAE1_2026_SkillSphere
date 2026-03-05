package com.esprit.examen.controllers;

import com.esprit.examen.dto.NotificationEventDTO;
import com.esprit.examen.services.NotificationHistoryService;
import com.esprit.examen.services.NotificationSseService;
import com.esprit.examen.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping({
        "/api/notifications",
        "/api/community/notifications",
        "/notifications",
        "/community/notifications"
})
@CrossOrigin(origins = "*")
@Tag(name = "Notification", description = "Real-time notification stream APIs")
public class NotificationStreamController {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationStreamController.class);

    private final NotificationSseService notificationSseService;
    private final NotificationHistoryService notificationHistoryService;
    private final UserService userService;

    public NotificationStreamController(
            NotificationSseService notificationSseService,
            NotificationHistoryService notificationHistoryService,
            UserService userService
    ) {
        this.notificationSseService = notificationSseService;
        this.notificationHistoryService = notificationHistoryService;
        this.userService = userService;
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to real-time notifications stream")
    public SseEmitter stream(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(value = "token", required = false) String token,
            @RequestParam(value = "since", required = false) String since,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        String credential = firstNonBlank(authorizationHeader, token);
        Long currentUserId = resolveCurrentUserId(credential);

        SseEmitter emitter = notificationSseService.subscribe(currentUserId);

        LocalDateTime sinceDateTime = parseSince(since);
        int normalizedLimit = normalizeLimit(limit);
        List<NotificationEventDTO> history = notificationHistoryService.getHistoryForUser(
                currentUserId,
                sinceDateTime,
                normalizedLimit,
                credential
        );

        try {
            for (NotificationEventDTO event : history) {
                emitter.send(SseEmitter.event().name("notification").data(event));
            }
        } catch (IOException ex) {
            LOGGER.warn("Failed to replay notification history for userId={}", currentUserId, ex);
            emitter.completeWithError(ex);
        }

        return emitter;
    }

    @GetMapping("/history")
    @Operation(summary = "Get recent notifications history for authenticated user")
    public ResponseEntity<List<NotificationEventDTO>> history(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(value = "token", required = false) String token,
            @RequestParam(value = "since", required = false) String since,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        String credential = firstNonBlank(authorizationHeader, token);
        Long currentUserId = resolveCurrentUserId(credential);

        List<NotificationEventDTO> history = notificationHistoryService.getHistoryForUser(
                currentUserId,
                parseSince(since),
                normalizeLimit(limit),
                credential
        );

        return ResponseEntity.ok(history);
    }

    @PostMapping("/test")
    @Operation(summary = "Push a test notification to the authenticated user")
    public ResponseEntity<Void> pushTest(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(value = "token", required = false) String token
    ) {
        String credential = firstNonBlank(authorizationHeader, token);
        Long currentUserId = resolveCurrentUserId(credential);

        notificationSseService.sendToUser(
                currentUserId,
                new NotificationEventDTO(
                        "message",
                        "Test notification from SSE endpoint",
                        null,
                        null,
                        null,
                        LocalDateTime.now().toString()
                )
        );

        return ResponseEntity.ok().build();
    }

    private Long resolveCurrentUserId(String credential) {
        if (credential == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authentication token");
        }

        try {
            return userService.getCurrentUserIdFromToken(credential);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication token");
        }
    }

    private LocalDateTime parseSince(String since) {
        if (since == null || since.isBlank()) {
            return null;
        }

        String normalized = since.trim();

        try {
            return OffsetDateTime.parse(normalized)
                    .atZoneSameInstant(ZoneId.systemDefault())
                    .toLocalDateTime();
        } catch (RuntimeException ignored) {
            // fallback below
        }

        try {
            return LocalDateTime.parse(normalized);
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return 50;
        }
        return Math.min(limit, 100);
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }

        if (second != null && !second.isBlank()) {
            return second;
        }

        return null;
    }
}
