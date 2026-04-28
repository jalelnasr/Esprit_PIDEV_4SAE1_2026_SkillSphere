package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByIsLookingForJobTrue();
    @Query("SELECT c FROM Candidate c WHERE LOWER(c.skills) LIKE LOWER(CONCAT('%', :skill, '%'))")
    List<Candidate> findBySkill(String skill);
}

