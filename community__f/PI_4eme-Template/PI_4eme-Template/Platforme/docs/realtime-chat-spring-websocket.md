# Real-Time Chat Backend (Spring Boot)

This frontend now uses STOMP over WebSocket (`/app/chat.send`, `/user/queue/messages`, `/user/queue/typing`).

Use the backend setup below in your Spring Boot API.

## 1) Dependencies (Maven)

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

## 2) WebSocket Config

```java
package com.example.community.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

## 3) DTOs

```java
package com.example.community.chat;

public record ChatSendRequest(
    Long receiverId,
    String content,
    Long conversationId,
    String clientMessageId
) {}

public record ChatTypingRequest(
    Long fromUserId,
    Long toUserId,
    boolean isTyping,
    Long conversationId
) {}

public record ChatMessagePayload(
    Long messageId,
    Long senderId,
    Long receiverId,
    String content,
    String createdAt,
    boolean isRead,
    Long conversationId,
    String clientMessageId
) {}
```

## 4) Live Chat Controller

```java
package com.example.community.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @MessageMapping("/chat.send")
    public void send(ChatSendRequest request) {
        var saved = messageService.saveMessage(request.receiverId(), request.content(), request.clientMessageId());

        var payload = new ChatMessagePayload(
                saved.getMessageId(),
                saved.getSenderId(),
                saved.getReceiverId(),
                saved.getContent(),
                saved.getCreatedAt().toString(),
                saved.isRead(),
                saved.getConversationId(),
                saved.getClientMessageId()
        );

        // Receiver private queue
        messagingTemplate.convertAndSendToUser(
                String.valueOf(saved.getReceiverId()),
                "/queue/messages",
                payload
        );

        // Sender private queue (ack + synced id/timestamp)
        messagingTemplate.convertAndSendToUser(
                String.valueOf(saved.getSenderId()),
                "/queue/messages",
                payload
        );

        // Optional topic broadcast by conversation id
        if (saved.getConversationId() != null) {
            messagingTemplate.convertAndSend("/topic/conversation/" + saved.getConversationId(), payload);
        }
    }

    @MessageMapping("/chat.typing")
    public void typing(ChatTypingRequest request) {
        messagingTemplate.convertAndSendToUser(
                String.valueOf(request.toUserId()),
                "/queue/typing",
                request
        );
    }
}
```

## 5) Keep REST for history

Keep your current endpoint for initial load:

`GET /api/messages/conversation/{userId}`

Frontend behavior:
- REST loads old messages when opening a conversation
- WebSocket delivers only new messages/typing updates
