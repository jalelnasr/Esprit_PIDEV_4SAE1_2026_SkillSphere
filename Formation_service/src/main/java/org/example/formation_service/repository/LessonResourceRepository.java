package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.LessonResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonResourceRepository extends JpaRepository<LessonResource, Long> {
}
