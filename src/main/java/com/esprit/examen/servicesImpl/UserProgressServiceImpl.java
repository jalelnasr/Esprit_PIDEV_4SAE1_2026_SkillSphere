package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.LabStep;
import com.esprit.examen.entities.User;
import com.esprit.examen.entities.UserProgress;
import com.esprit.examen.repositories.LabStepRepository;
import com.esprit.examen.repositories.UserProgressRepository;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.services.UserProgressService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserProgressServiceImpl implements UserProgressService {

    @Resource
    private UserProgressRepository userProgressRepository;

    @Resource
    private UserRepository userRepository;

    @Resource
    private LabStepRepository labStepRepository;

    @Override
    public UserProgress createProgress(UserProgress progress, Long userId, Long stepId) {
        User user = userRepository.findById(userId).orElse(null);
        LabStep labStep = labStepRepository.findById(stepId).orElse(null);
        progress.setUser(user);
        progress.setLabStep(labStep);
        return userProgressRepository.save(progress);
    }

    @Override
    public UserProgress getProgressById(Long id) {
        return userProgressRepository.findById(id).orElse(null);
    }

    @Override
    public List<UserProgress> getProgressByUser(Long userId) {
        return userProgressRepository.findByUserIdUser(userId);
    }

    @Override
    public List<UserProgress> getProgressByUserAndLab(Long userId, Long labId) {
        return userProgressRepository.findByUserIdUserAndLabStepLabLabId(userId, labId);
    }

    @Override
    public UserProgress updateProgress(Long id, UserProgress progress) {
        UserProgress existing = userProgressRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setCompleted(progress.getCompleted());
            existing.setSubmittedFlag(progress.getSubmittedFlag());
            existing.setCompletedAt(progress.getCompletedAt());
            existing.setAttempts(progress.getAttempts());
            return userProgressRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteProgress(Long id) {
        userProgressRepository.deleteById(id);
    }
}