package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.Enrollment;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    List<Enrollment> findByUserId(Long userId);
    List<Enrollment> findByCourseId(Long courseId);
    List<Enrollment> findByCourseIdIn(List<Long> courseIds);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    boolean existsByCourseIdAndUserIdAndStatus(Long courseId, Long userId, EnrollmentStatus status);
    
    // New methods for enrollment status checking
    boolean existsByUserIdAndCourseIdAndStatus(Long userId, Long courseId, EnrollmentStatus status);
    
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.userId = :userId AND e.inscriptionDate >= :startDate AND e.status != :excludedStatus")
    int countByUserIdAndEnrolledAtAfterAndStatusNot(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("excludedStatus") EnrollmentStatus excludedStatus
    );

    List<Enrollment> findByCourse_IdAndStatus(Long courseId, EnrollmentStatus status);
}
