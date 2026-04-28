package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobOfferId(Long jobOfferId);
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByStatus(Application.ApplicationStatus status);
    Optional<Application> findByJobOfferIdAndCandidateId(Long jobOfferId, Long candidateId);
    @Query("SELECT a FROM Application a WHERE a.jobOffer.id = :jobOfferId ORDER BY a.matchScore DESC")
    List<Application> findTopByJobOfferOrderByMatchScore(Long jobOfferId);
}

