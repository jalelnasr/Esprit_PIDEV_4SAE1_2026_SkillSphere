package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByCourseId(Long courseId);
    List<Session> findByCourseIdIn(List<Long> courseIds);
    
    @Query("SELECT s FROM Session s WHERE s.course.createdBy = :instructorId ORDER BY s.startAt DESC")
    List<Session> findByInstructorId(@Param("instructorId") Long instructorId);
}
