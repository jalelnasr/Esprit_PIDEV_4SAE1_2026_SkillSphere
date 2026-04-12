package com.esprit.examen.repositories;

import com.esprit.examen.entities.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupGroupId(Long groupId);
    List<GroupMember> findByGroupGroupIdIn(Collection<Long> groupIds);
    List<GroupMember> findByUserId(Long userId);
    List<GroupMember> findByUserIdIn(Collection<Long> userIds);
    GroupMember findByGroupGroupIdAndUserId(Long groupId, Long userId);
    boolean existsByGroupGroupIdAndUserId(Long groupId, Long userId);
    long countByGroupGroupId(Long groupId);
    List<GroupMember> findByJoinedAtAfterOrderByJoinedAtDesc(LocalDateTime date, Pageable pageable);
    long countByJoinedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("select distinct gm.userId from GroupMember gm where gm.joinedAt >= :startDate and gm.joinedAt < :endDate")
    List<Long> findDistinctUserIdsByJoinedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
