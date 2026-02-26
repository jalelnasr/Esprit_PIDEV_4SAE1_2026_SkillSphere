package com.esprit.examen.repositories;

import com.esprit.examen.entities.LabReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabReviewRepository extends JpaRepository<LabReview, Long> {

    List<LabReview> findByLabLabIdOrderByCreatedAtDesc(Long labId);

    List<LabReview> findByUserIdUserOrderByCreatedAtDesc(Long userId);

    Optional<LabReview> findByUserIdUserAndLabLabId(Long userId, Long labId);

    boolean existsByUserIdUserAndLabLabId(Long userId, Long labId);

    @Query("SELECT AVG(r.rating) FROM LabReview r WHERE r.lab.labId = :labId")
    Double getAverageRatingByLabId(@Param("labId") Long labId);

    @Query("SELECT COUNT(r) FROM LabReview r WHERE r.lab.labId = :labId")
    Long getReviewCountByLabId(@Param("labId") Long labId);

    long count();
}
