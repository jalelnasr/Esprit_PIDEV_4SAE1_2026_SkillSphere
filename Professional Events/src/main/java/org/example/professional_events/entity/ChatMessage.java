package org.example.professional_events.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;
    
    @Column(name = "competition_id", nullable = false)
    private Long competitionId;
    
    @Column(name = "sender_id", nullable = false)
    private Long senderId;
    
    @Column(name = "sender_name", nullable = false)
    private String senderName;
    
    @Column(name = "sender_role", nullable = false)
    private String senderRole;
    
    @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
    private String messageText;
    
    @Column(name = "message_type")
    private String messageType = "TEXT";
    
    @Column(name = "recipient_type")
    private String recipientType = "GENERAL"; // GENERAL, TEAM, PRIVATE
    
    @Column(name = "recipient_id")
    private Long recipientId; // userId for private messages
    
    @Column(name = "team_id")
    private Long teamId; // teamId for team messages
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt = LocalDateTime.now();
    
    @Column(name = "is_read")
    private Boolean isRead = false;
}
