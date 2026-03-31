package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.SessionEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionEnrollmentRepository extends JpaRepository<SessionEnrollment, Long> {
    
    boolean existsByUserIdAndSessionIdAndStatus(Long userId, Long sessionId, String status);
    
    Optional<SessionEnrollment> findByUserIdAndSessionId(Long userId, Long sessionId);
    
    @Query("SELECT se.session.id FROM SessionEnrollment se WHERE se.userId = :userId AND se.status = 'ACTIVE'")
    List<Long> findSessionIdsByUserId(@Param("userId") Long userId);
    
    List<SessionEnrollment> findByUserId(Long userId);
    
    List<SessionEnrollment> findBySessionId(Long sessionId);
    
    long countBySessionIdAndStatus(Long sessionId, String status);
}
