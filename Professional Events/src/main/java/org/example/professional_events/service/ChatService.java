package org.example.professional_events.service;

import org.example.professional_events.entity.ChatMessage;
import org.example.professional_events.entity.ChatParticipant;
import org.example.professional_events.repository.ChatMessageRepository;
import org.example.professional_events.repository.ChatParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatParticipantRepository chatParticipantRepository;

    // Save message to database
    @Transactional
    public ChatMessage saveMessage(ChatMessage message) {
        message.setSentAt(LocalDateTime.now());
        return chatMessageRepository.save(message);
    }

    // Get chat history for a competition
    public List<ChatMessage> getChatHistory(Long competitionId) {
        return chatMessageRepository.findByCompetitionIdOrderBySentAtAsc(competitionId);
    }
    
    // Get filtered messages for a user based on their role and team
    public List<ChatMessage> getFilteredMessages(Long competitionId, Long userId, String userRole, Long teamId) {
        List<ChatMessage> allMessages = chatMessageRepository.findByCompetitionIdOrderBySentAtAsc(competitionId);
        
        // FORMATEUR sees all messages
        if ("FORMATEUR".equals(userRole)) {
            return allMessages;
        }
        
        // PARTICIPANT sees:
        // 1. GENERAL messages (all participants + formateur)
        // 2. TEAM messages for their team
        // 3. PRIVATE messages sent to formateur (their own) or received from formateur
        return allMessages.stream()
            .filter(msg -> {
                // General messages - everyone sees
                if ("GENERAL".equals(msg.getRecipientType())) {
                    return true;
                }
                // Team messages - only team members see
                if ("TEAM".equals(msg.getRecipientType()) && teamId != null && teamId.equals(msg.getTeamId())) {
                    return true;
                }
                // Private messages - sender or recipient sees
                if ("PRIVATE".equals(msg.getRecipientType())) {
                    // Messages sent by this user to formateur
                    if (msg.getSenderId().equals(userId)) {
                        return true;
                    }
                    // Messages received from formateur
                    if (msg.getRecipientId() != null && msg.getRecipientId().equals(userId)) {
                        return true;
                    }
                }
                return false;
            })
            .toList();
    }

    // Mark messages as read
    @Transactional
    public void markMessagesAsRead(Long competitionId, Long userId) {
        List<ChatMessage> messages = chatMessageRepository.findByCompetitionIdOrderBySentAtAsc(competitionId);
        messages.stream()
                .filter(msg -> !msg.getSenderId().equals(userId) && !msg.getIsRead())
                .forEach(msg -> {
                    msg.setIsRead(true);
                    chatMessageRepository.save(msg);
                });
    }

    // Get unread message count
    public Long getUnreadCount(Long competitionId) {
        return chatMessageRepository.countByCompetitionIdAndIsReadFalse(competitionId);
    }

    // User joins chat
    @Transactional
    public ChatParticipant joinChat(Long competitionId, Long userId, String userName, String userRole) {
        var existing = chatParticipantRepository.findByCompetitionIdAndUserId(competitionId, userId);
        
        if (existing.isPresent()) {
            ChatParticipant participant = existing.get();
            participant.setIsOnline(true);
            participant.setLastSeenAt(LocalDateTime.now());
            return chatParticipantRepository.save(participant);
        }
        
        ChatParticipant participant = new ChatParticipant();
        participant.setCompetitionId(competitionId);
        participant.setUserId(userId);
        participant.setUserName(userName);
        participant.setUserRole(userRole);
        participant.setConnectedAt(LocalDateTime.now());
        participant.setLastSeenAt(LocalDateTime.now());
        participant.setIsOnline(true);
        
        return chatParticipantRepository.save(participant);
    }

    // User leaves chat
    @Transactional
    public void leaveChat(Long competitionId, Long userId) {
        var participant = chatParticipantRepository.findByCompetitionIdAndUserId(competitionId, userId);
        participant.ifPresent(p -> {
            p.setIsOnline(false);
            p.setLastSeenAt(LocalDateTime.now());
            chatParticipantRepository.save(p);
        });
    }

    // Get online participants
    public List<ChatParticipant> getOnlineParticipants(Long competitionId) {
        return chatParticipantRepository.findByCompetitionIdAndIsOnlineTrue(competitionId);
    }

    // Get online count
    public Long getOnlineCount(Long competitionId) {
        return chatParticipantRepository.countByCompetitionIdAndIsOnlineTrue(competitionId);
    }
}
