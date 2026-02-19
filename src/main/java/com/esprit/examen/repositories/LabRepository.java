package com.esprit.examen.repositories;

import com.esprit.examen.entities.Lab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabRepository extends JpaRepository<Lab, Long> {

    List<Lab> findByCategoryCategoryId(Long categoryId);

    List<Lab> findByDifficulty(String difficulty);

    List<Lab> findByActiveTrue();

    List<Lab> findByRequiredLevelLessThanEqual(Integer level);
}