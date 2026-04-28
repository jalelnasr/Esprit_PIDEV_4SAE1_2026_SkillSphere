package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Optional<Progress> findByAssignmentId(Long assignmentId);
    @Query("SELECT AVG(p.progressPercent) FROM Progress p WHERE p.assignment.pack.id = :packId")
    Double averageProgressByPackId(Long packId);
    @Query("SELECT AVG(p.progressPercent) FROM Progress p WHERE p.assignment.company.id = :companyId")
    Double averageProgressByCompanyId(Long companyId);
}

