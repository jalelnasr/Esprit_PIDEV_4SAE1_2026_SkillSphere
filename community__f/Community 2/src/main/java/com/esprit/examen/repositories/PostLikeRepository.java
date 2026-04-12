package com.esprit.examen.repositories;

import com.esprit.examen.entities.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    List<PostLike> findByPostPostId(Long postId);
    List<PostLike> findByUserId(Long userId);
    List<PostLike> findByPostPostIdInAndUserIdNotIn(Collection<Long> postIds, Collection<Long> excludedUserIds);
    List<PostLike> findByPostGroupIdInAndCreatedAtAfter(Collection<Long> groupIds, LocalDateTime createdAt);
    PostLike findByUserIdAndPostPostId(Long userId, Long postId);
    List<PostLike> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date, Pageable pageable);
    long countByPostPostId(Long postId);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("select distinct pl.userId from PostLike pl where pl.createdAt >= :startDate and pl.createdAt < :endDate")
    List<Long> findDistinctUserIdsByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("select pl from PostLike pl join pl.post p where p.userId = :postOwnerId and pl.userId <> :postOwnerId and pl.createdAt > :since order by pl.createdAt desc")
    List<PostLike> findReceivedLikesSince(
        @Param("postOwnerId") Long postOwnerId,
        @Param("since") LocalDateTime since,
        Pageable pageable
    );

    @Query("select pl from PostLike pl join pl.post p where p.userId = :postOwnerId and pl.userId <> :postOwnerId order by pl.createdAt desc")
    List<PostLike> findRecentReceivedLikes(
        @Param("postOwnerId") Long postOwnerId,
        Pageable pageable
    );
}
