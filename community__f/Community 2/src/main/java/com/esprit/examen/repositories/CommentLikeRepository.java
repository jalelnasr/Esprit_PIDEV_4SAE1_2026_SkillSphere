package com.esprit.examen.repositories;

import com.esprit.examen.entities.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    List<CommentLike> findByCommentCommentId(Long commentId);
    CommentLike findByUserIdAndCommentCommentId(Long userId, Long commentId);
    List<CommentLike> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date, Pageable pageable);
    long countByCommentCommentId(Long commentId);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("select distinct cl.userId from CommentLike cl where cl.createdAt >= :startDate and cl.createdAt < :endDate")
    List<Long> findDistinctUserIdsByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
