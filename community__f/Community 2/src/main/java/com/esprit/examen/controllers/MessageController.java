package com.esprit.examen.controllers;

import com.esprit.examen.entities.Message;
import com.esprit.examen.services.MessageService;
import com.esprit.examen.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@Tag(name = "Message", description = "Message management APIs")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @PostMapping("/{receiverId}")
    @Operation(summary = "Send a message (automatically uses current user as sender)")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message, @PathVariable Long receiverId) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(messageService.sendMessage(message, currentUserId, receiverId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get message by ID")
    public ResponseEntity<Message> getMessageById(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.getMessageById(id));
    }

    @GetMapping("/between/{senderId}/{receiverId}")
    @Operation(summary = "Get messages between two users")
    public ResponseEntity<List<Message>> getMessagesBetweenUsers(@PathVariable Long senderId, @PathVariable Long receiverId) {
        return ResponseEntity.ok(messageService.getMessagesBetweenUsers(senderId, receiverId));
    }

    @GetMapping("/conversation/{userId}")
    @Operation(summary = "Get conversation with selected user for the authenticated user")
    public ResponseEntity<List<Message>> getConversation(@PathVariable("userId") Long otherUserId) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(messageService.getConversation(currentUserId, otherUserId));
    }

    @GetMapping("/sent/{senderId}")
    @Operation(summary = "Get sent messages")
    public ResponseEntity<List<Message>> getSentMessages(@PathVariable Long senderId) {
        return ResponseEntity.ok(messageService.getSentMessages(senderId));
    }

    @GetMapping("/received/{receiverId}")
    @Operation(summary = "Get received messages")
    public ResponseEntity<List<Message>> getReceivedMessages(@PathVariable Long receiverId) {
        return ResponseEntity.ok(messageService.getReceivedMessages(receiverId));
    }

    @GetMapping("/unread/{receiverId}")
    @Operation(summary = "Get unread messages")
    public ResponseEntity<List<Message>> getUnreadMessages(@PathVariable Long receiverId) {
        return ResponseEntity.ok(messageService.getUnreadMessages(receiverId));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark message as read")
    public ResponseEntity<Message> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.markAsRead(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete message by ID")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok().build();
    }
}
