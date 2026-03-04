package com.esprit.examen.repositories;

import com.esprit.examen.entities.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByNameContainingIgnoreCase(String keyword);
    List<Group> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date, Pageable pageable);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("select distinct g.createdBy from Group g where g.createdAt >= :startDate and g.createdAt < :endDate")
    List<Long> findDistinctCreatorIdsByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
