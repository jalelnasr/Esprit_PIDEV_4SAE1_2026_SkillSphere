package com.esprit.examen.repositories;

import com.esprit.examen.entities.LabCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabCategoryRepository extends JpaRepository<LabCategory, Long> {

    LabCategory findByName(String name);
}