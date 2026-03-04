package com.esprit.examen.repositories;

import com.esprit.examen.entities.AnswerVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnswerVoteRepository extends JpaRepository<AnswerVote, Long> {
    List<AnswerVote> findByAnswerAnswerId(Long answerId);
    AnswerVote findByUserIdAndAnswerAnswerId(Long userId, Long answerId);
    List<AnswerVote> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date, Pageable pageable);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("select distinct av.userId from AnswerVote av where av.createdAt >= :startDate and av.createdAt < :endDate")
    List<Long> findDistinctUserIdsByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
