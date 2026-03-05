package org.example.professional_events.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sms_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SmsLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sms_id")
    private Long smsId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "sms_type", nullable = false, length = 50)
    private String smsType;

    @Column(name = "competition_id")
    private Long competitionId;

    @Column(name = "match_id")
    private Long matchId;

    @Column(name = "status", length = 20)
    private String status = "PENDING"; // PENDING, SENT, FAILED, DELIVERED

    @Column(name = "twilio_sid", length = 100)
    private String twilioSid;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum SmsType {
        MATCH_REMINDER,
        TEAM_QUALIFIED,
        WINNER_NOTIFICATION,
        MATCH_STARTED,
        MATCH_RESULT,
        GENERAL
    }

    public enum SmsStatus {
        PENDING,
        SENT,
        FAILED,
        DELIVERED
    }
}
