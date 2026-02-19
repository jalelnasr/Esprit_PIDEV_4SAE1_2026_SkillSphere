package com.esprit.examen.repositories;

import com.esprit.examen.entities.LabStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabStepRepository extends JpaRepository<LabStep, Long> {

    List<LabStep> findByLabLabId(Long labId);

    List<LabStep> findByLabLabIdOrderByStepNumberAsc(Long labId);
}