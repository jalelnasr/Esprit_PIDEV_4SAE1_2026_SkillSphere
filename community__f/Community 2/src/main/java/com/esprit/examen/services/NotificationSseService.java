package com.esprit.examen.services;

import com.esprit.examen.dto.NotificationEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationSseService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationSseService.class);
    private static final int MAX_PENDING_PER_USER = 40;

    private final Map<Long, List<SseEmitter>> emittersByUserId = new ConcurrentHashMap<>();
    private final Map<Long, Deque<NotificationEventDTO>> pendingNotificationsByUserId = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(0L);

        emittersByUserId
                .computeIfAbsent(userId, ignored -> new CopyOnWriteArrayList<>())
                .add(emitter);

        LOGGER.info("SSE subscribe: userId={} activeEmitters={}", userId, emittersByUserId.get(userId).size());

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(error -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event().name("ping").data("connected"));
            flushPendingNotifications(userId, emitter);
        } catch (IOException ex) {
            removeEmitter(userId, emitter);
            emitter.completeWithError(ex);
        }

        return emitter;
    }

    public void sendToUser(Long userId, NotificationEventDTO payload) {
        List<SseEmitter> emitters = emittersByUserId.get(userId);
        if (emitters == null || emitters.isEmpty()) {
            enqueuePendingNotification(userId, payload);
            LOGGER.info("SSE queue notification: userId={} type={} (no active emitters)", userId, payload.type());
            return;
        }

        boolean delivered = false;
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(payload));
                delivered = true;
            } catch (IOException ex) {
                removeEmitter(userId, emitter);
                emitter.completeWithError(ex);
            }
        }

        if (!delivered) {
            enqueuePendingNotification(userId, payload);
            LOGGER.info("SSE queue notification: userId={} type={} (delivery failed)", userId, payload.type());
            return;
        }

        LOGGER.info("SSE delivered notification: userId={} type={} activeEmitters={}", userId, payload.type(), emitters.size());
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> emitters = emittersByUserId.get(userId);
        if (emitters == null) {
            return;
        }

        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByUserId.remove(userId);
        }
    }

    private void enqueuePendingNotification(Long userId, NotificationEventDTO payload) {
        Deque<NotificationEventDTO> queue = pendingNotificationsByUserId.computeIfAbsent(userId, ignored -> new ArrayDeque<>());
        synchronized (queue) {
            queue.addLast(payload);
            while (queue.size() > MAX_PENDING_PER_USER) {
                queue.pollFirst();
            }
        }
    }

    private void flushPendingNotifications(Long userId, SseEmitter emitter) throws IOException {
        Deque<NotificationEventDTO> queue = pendingNotificationsByUserId.get(userId);
        if (queue == null) {
            return;
        }

        List<NotificationEventDTO> pending = new ArrayList<>();
        synchronized (queue) {
            while (!queue.isEmpty()) {
                NotificationEventDTO item = queue.pollFirst();
                if (item != null) {
                    pending.add(item);
                }
            }
        }

        if (pending.isEmpty()) {
            return;
        }

        for (NotificationEventDTO payload : pending) {
            emitter.send(SseEmitter.event().name("notification").data(payload));
        }

        pendingNotificationsByUserId.remove(userId, queue);
        LOGGER.info("SSE flushed {} pending notifications for userId={}", pending.size(), userId);
    }
}
