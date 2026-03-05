package org.example.professional_events.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatParticipant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long participantId;
    
    @Column(name = "competition_id", nullable = false)
    private Long competitionId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "user_name", nullable = false)
    private String userName;
    
    @Column(name = "user_role", nullable = false)
    private String userRole;
    
    @Column(name = "connected_at")
    private LocalDateTime connectedAt = LocalDateTime.now();
    
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt = LocalDateTime.now();
    
    @Column(name = "is_online")
    private Boolean isOnline = true;
}
