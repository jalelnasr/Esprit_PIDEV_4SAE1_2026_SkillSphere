package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.MeetJoin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MeetJoinRepository extends JpaRepository<MeetJoin, Long> {
    Optional<MeetJoin> findByMeet_IdAndUserId(Long meetId, Long userId);
    long countByMeet_Id(Long meetId);
}
