# Real-Time Notifications (SSE) - Spring Boot Backend

The Angular frontend now expects an SSE stream at:

`GET /api/notifications/stream`

It listens for payloads shaped like:

```json
{
  "type": "like",
  "text": "Alice liked your post",
  "relatedUserId": 42,
  "postId": 1001,
  "messageId": null,
  "createdAt": "2026-03-04T12:32:41.337Z"
}
```

No polling is needed. The frontend auto-reconnects.

## 1) Notification Payload DTO

```java
package com.example.community.notifications;

import java.time.Instant;

public record NotificationEventPayload(
        String type,
        String text,
        Long relatedUserId,
        Long postId,
        Long messageId,
        Instant createdAt
) {}
```

## 2) SSE Emitter Registry Service

```java
package com.example.community.notifications;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationSseService {

    private final Map<Long, List<SseEmitter>> emittersByUser = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(0L);
        emittersByUser.computeIfAbsent(userId, id -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(error -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(new NotificationEventPayload(
                            "message",
                            "Connected to notifications",
                            null,
                            null,
                            null,
                            Instant.now()
                    )));
        } catch (IOException ignored) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    public void sendToUser(Long userId, NotificationEventPayload payload) {
        List<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(payload));
            } catch (IOException ex) {
                removeEmitter(userId, emitter);
            }
        }
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters == null) {
            return;
        }

        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByUser.remove(userId);
        }
    }
}
```

## 3) SSE Controller Endpoint

```java
package com.example.community.notifications;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationSseController {

    private final NotificationSseService notificationSseService;

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            Authentication authentication,
            @RequestParam(value = "token", required = false) String token
    ) {
        Long userId = resolveUserId(authentication, token);
        return notificationSseService.subscribe(userId);
    }

    private Long resolveUserId(Authentication authentication, String token) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            Object claim = jwt.getClaims().getOrDefault("idUser",
                    jwt.getClaims().getOrDefault("userId", jwt.getClaims().get("sub")));
            return Long.parseLong(String.valueOf(claim));
        }

        // Optional fallback if you allow token query param for EventSource.
        // Parse JWT token string here and extract user id claim.
        throw new IllegalStateException("Unable to resolve user id from JWT");
    }
}
```

## 4) Trigger Notifications on Existing Events

No new DB tables required.

Call `NotificationSseService.sendToUser(...)` inside your existing services after save succeeds:

- Like post: notify post owner
- Follow user: notify followed user
- Message received: notify receiver

Example:

```java
notificationSseService.sendToUser(
    postOwnerId,
    new NotificationEventPayload(
        "like",
        actorName + " liked your post",
        actorUserId,
        postId,
        null,
        Instant.now()
    )
);
```

For follow:

```java
notificationSseService.sendToUser(
    followedUserId,
    new NotificationEventPayload(
        "follow",
        actorName + " started following you",
        actorUserId,
        null,
        null,
        Instant.now()
    )
);
```

For message:

```java
notificationSseService.sendToUser(
    receiverId,
    new NotificationEventPayload(
        "message",
        actorName + " sent you a message",
        senderId,
        null,
        messageId,
        Instant.now()
    )
);
```

## 5) Security + CORS Notes

- If Angular and API are different origins, allow CORS for `GET /api/notifications/stream`.
- Frontend currently opens `EventSource` with `?token=<jwt>` fallback.
- Prefer cookie/session auth for SSE in production, or parse JWT query token securely.

## 6) Concurrency

- `ConcurrentHashMap` + `CopyOnWriteArrayList` allows multiple tabs/users safely.
- Dead emitters are removed on completion/error/timeout.
