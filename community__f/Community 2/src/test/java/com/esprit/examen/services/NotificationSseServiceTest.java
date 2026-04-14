package com.esprit.examen.services;

import com.esprit.examen.dto.NotificationEventDTO;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Deque;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class NotificationSseServiceTest {

    @Test
    void sendToUser_withoutSubscribers_queuesNotificationsWithMaxCap() throws Exception {
        NotificationSseService service = new NotificationSseService();

        for (int index = 0; index < 45; index += 1) {
            service.sendToUser(8L, notification("message-" + index));
        }

        Map<Long, Deque<NotificationEventDTO>> pending = pendingQueueMap(service);
        assertTrue(pending.containsKey(8L));
        assertEquals(40, pending.get(8L).size());
    }

    @Test
    void subscribe_returnsEmitter_andFlushesPendingQueue() throws Exception {
        NotificationSseService service = new NotificationSseService();
        service.sendToUser(11L, notification("first"));
        service.sendToUser(11L, notification("second"));

        SseEmitter emitter = service.subscribe(11L);

        assertNotNull(emitter);
        Map<Long, Deque<NotificationEventDTO>> pending = pendingQueueMap(service);
        Deque<NotificationEventDTO> queue = pending.get(11L);
        assertTrue(queue == null || queue.isEmpty());
    }

    @SuppressWarnings("unchecked")
    private Map<Long, Deque<NotificationEventDTO>> pendingQueueMap(NotificationSseService service) throws Exception {
        Field field = NotificationSseService.class.getDeclaredField("pendingNotificationsByUserId");
        field.setAccessible(true);
        return (Map<Long, Deque<NotificationEventDTO>>) field.get(service);
    }

    private NotificationEventDTO notification(String text) {
        return new NotificationEventDTO("message", text, 1L, null, null, LocalDateTime.now().toString());
    }
}
