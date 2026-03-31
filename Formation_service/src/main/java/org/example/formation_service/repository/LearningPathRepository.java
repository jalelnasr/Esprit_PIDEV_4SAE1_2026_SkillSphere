package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.LearningPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningPathRepository extends JpaRepository<LearningPath, Long> {
}
