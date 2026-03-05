package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByCompanyId(Long companyId);
    List<JobOffer> findByStatus(JobOffer.JobOfferStatus status);
    @Query("SELECT j FROM JobOffer j WHERE j.status = 'OPEN' AND LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :skill, '%'))")
    List<JobOffer> findOpenBySkill(String skill);
}

