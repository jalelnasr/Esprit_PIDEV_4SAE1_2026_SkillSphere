package com.esprit.examen.repositories;

import com.esprit.examen.entities.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    List<UserProgress> findByUserUserId(Long userId);

    List<UserProgress> findByLabStepStepId(Long stepId);

    List<UserProgress> findByUserUserIdAndLabStepLabLabId(Long userId, Long labId);

    List<UserProgress> findByUserUserIdAndCompletedTrue(Long userId);
}