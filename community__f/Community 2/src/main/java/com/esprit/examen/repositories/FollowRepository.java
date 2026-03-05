package com.esprit.examen.repositories;

import com.esprit.examen.entities.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    List<Follow> findByFollowingId(Long followingId);
    List<Follow> findByFollowerId(Long followerId);
    Follow findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    List<Follow> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date, Pageable pageable);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("select distinct f.followerId from Follow f where f.createdAt >= :startDate and f.createdAt < :endDate")
    List<Long> findDistinctFollowerIdsByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("select distinct f.followingId from Follow f where f.createdAt >= :startDate and f.createdAt < :endDate")
    List<Long> findDistinctFollowingIdsByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    List<Follow> findByFollowingIdAndCreatedAtAfterOrderByCreatedAtDesc(Long followingId, LocalDateTime createdAt, Pageable pageable);

    List<Follow> findByFollowingIdOrderByCreatedAtDesc(Long followingId, Pageable pageable);
}
