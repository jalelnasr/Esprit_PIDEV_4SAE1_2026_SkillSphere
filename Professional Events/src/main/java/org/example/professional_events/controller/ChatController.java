package org.example.professional_events.controller;

import org.example.professional_events.entity.ChatMessage;
import org.example.professional_events.entity.ChatParticipant;
import org.example.professional_events.service.ChatService;
import org.example.professional_events.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private org.example.professional_events.service.NotificationService notificationService;

    // WebSocket: Send message
    @MessageMapping("/chat/{competitionId}/send")
    public void sendMessage(@DestinationVariable Long competitionId, ChatMessage message) {
        message.setCompetitionId(competitionId);
        ChatMessage saved = chatService.saveMessage(message);

        // Broadcast based on recipient type
        String recipientType = saved.getRecipientType() != null ? saved.getRecipientType() : "GENERAL";

        switch (recipientType) {
            case "GENERAL":
                // Broadcast to all participants
                messagingTemplate.convertAndSend("/topic/chat/" + competitionId, saved);
                // 🔔 NOTIFICATION AUTOMATIQUE: Nouveau message général
                notificationService.sendNotification(
                    saved.getRecipientId() != null ? saved.getRecipientId() : 0L,
                    "NEW_MESSAGE",
                    "Nouveau message",
                    saved.getSenderName() + ": " + saved.getMessageText(),
                    competitionId,
                    saved.getMessageId()
                );
                break;

            case "TEAM":
                // Broadcast to team members only (frontend will filter)
                messagingTemplate.convertAndSend("/topic/chat/" + competitionId + "/team/" + saved.getTeamId(), saved);
                // Also send to general topic so formateur can see
                messagingTemplate.convertAndSend("/topic/chat/" + competitionId, saved);
                break;

            case "PRIVATE":
                // Send to formateur and the specific participant
                messagingTemplate.convertAndSend("/topic/chat/" + competitionId + "/private/" + saved.getRecipientId(), saved);
                messagingTemplate.convertAndSend("/topic/chat/" + competitionId + "/private/" + saved.getSenderId(), saved);
                // 🔔 NOTIFICATION AUTOMATIQUE: Message privé
                notificationService.sendNotification(
                    saved.getRecipientId(),
                    "NEW_MESSAGE",
                    "Message privé de " + saved.getSenderName(),
                    saved.getMessageText(),
                    competitionId,
                    saved.getMessageId()
                );
                break;
        }
    }


    // WebSocket: User joins
    @MessageMapping("/chat/{competitionId}/join")
    @SendTo("/topic/chat/{competitionId}/participants")
    public Map<String, Object> joinChat(@DestinationVariable Long competitionId, Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String userName = payload.get("userName").toString();
        String userRole = payload.get("userRole").toString();
        
        ChatParticipant participant = chatService.joinChat(competitionId, userId, userName, userRole);
        List<ChatParticipant> onlineUsers = chatService.getOnlineParticipants(competitionId);
        
        return Map.of(
            "type", "USER_JOINED",
            "participant", participant,
            "onlineUsers", onlineUsers,
            "onlineCount", onlineUsers.size()
        );
    }

    // WebSocket: User leaves
    @MessageMapping("/chat/{competitionId}/leave")
    @SendTo("/topic/chat/{competitionId}/participants")
    public Map<String, Object> leaveChat(@DestinationVariable Long competitionId, Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        
        chatService.leaveChat(competitionId, userId);
        List<ChatParticipant> onlineUsers = chatService.getOnlineParticipants(competitionId);
        
        return Map.of(
            "type", "USER_LEFT",
            "userId", userId,
            "onlineUsers", onlineUsers,
            "onlineCount", onlineUsers.size()
        );
    }

    // REST: Get chat history
    @GetMapping("/competition/{competitionId}/history")
    public List<ChatMessage> getChatHistory(@PathVariable Long competitionId) {
        return chatService.getChatHistory(competitionId);
    }
    
    // REST: Get filtered chat history for a user
    @GetMapping("/competition/{competitionId}/history/filtered")
    public List<ChatMessage> getFilteredChatHistory(
            @PathVariable Long competitionId,
            @RequestParam Long userId,
            @RequestParam String userRole,
            @RequestParam(required = false) Long teamId) {
        return chatService.getFilteredMessages(competitionId, userId, userRole, teamId);
    }

    // REST: Get online participants
    @GetMapping("/competition/{competitionId}/participants")
    public List<ChatParticipant> getOnlineParticipants(@PathVariable Long competitionId) {
        return chatService.getOnlineParticipants(competitionId);
    }

    // REST: Mark messages as read
    @PostMapping("/competition/{competitionId}/mark-read")
    public Map<String, Object> markAsRead(
            @PathVariable Long competitionId,
            @RequestParam Long userId) {
        chatService.markMessagesAsRead(competitionId, userId);
        return Map.of("success", true);
    }

    // REST: Get unread count
    @GetMapping("/competition/{competitionId}/unread-count")
    public Map<String, Object> getUnreadCount(@PathVariable Long competitionId) {
        Long count = chatService.getUnreadCount(competitionId);
        return Map.of("unreadCount", count);
    }
}
