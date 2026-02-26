package com.esprit.examen.services;

import com.esprit.examen.entities.UserProgress;

public interface GamificationService {
    UserProgress submitFlag(Long userId, Long stepId, String submittedFlag);
}
