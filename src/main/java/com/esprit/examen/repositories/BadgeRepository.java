package com.esprit.examen.repositories;

import com.esprit.examen.entities.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    Badge findByName(String name);

    List<Badge> findByRequiredPointsLessThanEqual(Integer points);

    List<Badge> findByRequiredLevelLessThanEqual(Integer level);
}