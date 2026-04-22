package org.example.professional_events.repository;

import org.example.professional_events.entity.Competition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    List<Competition> findByStatus(Competition.CompetitionStatus status);
    Optional<Competition> findByTitle(String title);
    List<Competition> findByCreatedBy(Long createdBy);
    
    // Méthodes pour les statistiques
    Long countByCreatedBy(Long createdBy);
    Long countByCreatedByAndStatus(Long createdBy, Competition.CompetitionStatus status);
    Long countByCreatedByAndCreatedAtBetween(Long createdBy, LocalDateTime start, LocalDateTime end);
}



