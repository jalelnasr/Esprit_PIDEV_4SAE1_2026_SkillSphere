package com.esprit.examen.repositories;

import com.esprit.examen.entities.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    List<PostLike> findByPostPostId(Long postId);
    List<PostLike> findByUserId(Long userId);
    PostLike findByUserIdAndPostPostId(Long userId, Long postId);
    List<PostLike> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date, Pageable pageable);
    long countByPostPostId(Long postId);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("select distinct pl.userId from PostLike pl where pl.createdAt >= :startDate and pl.createdAt < :endDate")
    List<Long> findDistinctUserIdsByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
