package com.esprit.examen.repositories;

import com.esprit.examen.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderId(Long senderId);
    List<Message> findByReceiverId(Long receiverId);
    List<Message> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    @Query("select m from Message m where (m.senderId = :currentUserId and m.receiverId = :otherUserId) or (m.senderId = :otherUserId and m.receiverId = :currentUserId) order by m.createdAt asc")
    List<Message> findConversationMessages(
        @Param("currentUserId") Long currentUserId,
        @Param("otherUserId") Long otherUserId
    );
    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);
    List<Message> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date, Pageable pageable);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("select distinct m.senderId from Message m where m.createdAt >= :startDate and m.createdAt < :endDate")
    List<Long> findDistinctSenderIdsByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("select distinct m.receiverId from Message m where m.createdAt >= :startDate and m.createdAt < :endDate")
    List<Long> findDistinctReceiverIdsByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    List<Message> findByReceiverIdAndCreatedAtAfterOrderByCreatedAtDesc(Long receiverId, LocalDateTime createdAt, Pageable pageable);

    List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId, Pageable pageable);
}
