package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Message;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.MessageRepository;
import com.esprit.examen.services.MessageService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    @Resource
    private MessageRepository messageRepository;

    @Resource
    private UserService userService;

    @Override
    public Message sendMessage(Message message, Long currentUserId, Long receiverId) {
        if (!userService.userExists(currentUserId)) {
            throw new RuntimeException("Sender not found with ID: " + currentUserId);
        }
        if (!userService.userExists(receiverId)) {
            throw new RuntimeException("Receiver not found with ID: " + receiverId);
        }
        message.setSenderId(currentUserId);
        message.setReceiverId(receiverId);
        message.setCreatedAt(LocalDateTime.now());
        message.setIsRead(false);
        // Don't set messageId - let database auto-generate it
        return messageRepository.save(message);
    }

    @Override
    public Message getMessageById(Long id) {
        return messageRepository.findById(id).orElse(null);
    }

    @Override
    public List<Message> getConversation(Long currentUserId, Long otherUserId) {
        if (!userService.userExists(currentUserId)) {
            throw new RuntimeException("User not found with ID: " + currentUserId);
        }

        if (!userService.userExists(otherUserId)) {
            throw new RuntimeException("User not found with ID: " + otherUserId);
        }

        return messageRepository.findConversationMessages(currentUserId, otherUserId);
    }

    @Override
    public List<Message> getMessagesBetweenUsers(Long senderId, Long receiverId) {
        return messageRepository.findConversationMessages(senderId, receiverId);
    }

    @Override
    public List<Message> getSentMessages(Long senderId) {
        return messageRepository.findBySenderId(senderId);
    }

    @Override
    public List<Message> getReceivedMessages(Long receiverId) {
        return messageRepository.findByReceiverId(receiverId);
    }

    @Override
    public List<Message> getUnreadMessages(Long receiverId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(receiverId);
    }

    @Override
    public Message markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId).orElse(null);
        if (message != null) {
            message.setIsRead(true);
            return messageRepository.save(message);
        }
        return null;
    }

    @Override
    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}
