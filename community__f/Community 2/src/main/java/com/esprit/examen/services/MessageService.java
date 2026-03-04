package com.esprit.examen.services;

import com.esprit.examen.entities.Message;

import java.util.List;

public interface MessageService {
    Message sendMessage(Message message, Long currentUserId, Long receiverId);
    Message getMessageById(Long id);
    List<Message> getConversation(Long currentUserId, Long otherUserId);
    List<Message> getMessagesBetweenUsers(Long senderId, Long receiverId);
    List<Message> getSentMessages(Long senderId);
    List<Message> getReceivedMessages(Long receiverId);
    List<Message> getUnreadMessages(Long receiverId);
    Message markAsRead(Long messageId);
    void deleteMessage(Long id);
}
