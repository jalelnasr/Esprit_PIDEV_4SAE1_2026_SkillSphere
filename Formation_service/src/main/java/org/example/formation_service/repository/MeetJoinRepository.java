package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.MeetJoin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MeetJoinRepository extends JpaRepository<MeetJoin, Long> {
    Optional<MeetJoin> findByMeet_IdAndUserId(Long meetId, Long userId);
    long countByMeet_Id(Long meetId);

    @Modifying
    @Query(value = "DELETE FROM meet_joins WHERE meet_id = :meetId", nativeQuery = true)
    void deleteByMeetIdNative(@Param("meetId") Long meetId);
}
