package com.esprit.examen.repositories;

import com.esprit.examen.entities.LabInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabInstanceRepository extends JpaRepository<LabInstance, Long> {

    List<LabInstance> findByUserUserId(Long userId);

    List<LabInstance> findByLabLabId(Long labId);

    List<LabInstance> findByStatus(String status);

    List<LabInstance> findByUserUserIdAndStatus(Long userId, String status);
}