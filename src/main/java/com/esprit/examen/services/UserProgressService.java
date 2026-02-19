package com.esprit.examen.services;

import com.esprit.examen.entities.UserProgress;

import java.util.List;

public interface UserProgressService {

    UserProgress createProgress(UserProgress progress, Long userId, Long stepId);

    UserProgress getProgressById(Long id);

    List<UserProgress> getProgressByUser(Long userId);

    List<UserProgress> getProgressByUserAndLab(Long userId, Long labId);

    UserProgress updateProgress(Long id, UserProgress progress);

    void deleteProgress(Long id);
}