package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Badge;
import com.esprit.examen.entities.LabStep;
import com.esprit.examen.entities.User;
import com.esprit.examen.entities.UserProgress;
import com.esprit.examen.exceptions.BadRequestException;
import com.esprit.examen.exceptions.ResourceNotFoundException;
import com.esprit.examen.repositories.BadgeRepository;
import com.esprit.examen.repositories.LabStepRepository;
import com.esprit.examen.repositories.UserProgressRepository;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.services.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GamificationServiceImpl implements GamificationService {

    private final UserRepository userRepository;
    private final LabStepRepository labStepRepository;
    private final UserProgressRepository userProgressRepository;
    private final BadgeRepository badgeRepository;

    @Override
    @Transactional
    public UserProgress submitFlag(Long userId, Long stepId, String submittedFlag) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        LabStep step = labStepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab step not found: " + stepId));

        // Check if already completed
        Optional<UserProgress> existingProgress = userProgressRepository.findByUserIdUserAndLabStepStepId(userId, stepId);
        if (existingProgress.isPresent() && Boolean.TRUE.equals(existingProgress.get().getCompleted())) {
            throw new BadRequestException("Step already completed");
        }

        // Get or create progress record
        UserProgress progress = existingProgress.orElseGet(() -> {
            UserProgress newProgress = new UserProgress();
            newProgress.setUser(user);
            newProgress.setLabStep(step);
            newProgress.setCompleted(false);
            newProgress.setAttempts(0);
            return newProgress;
        });

        progress.setAttempts(progress.getAttempts() + 1);
        progress.setSubmittedFlag(submittedFlag);

        // Validate flag
        if (!submittedFlag.equals(step.getFlag())) {
            return userProgressRepository.save(progress);
        }

        // Flag is correct - mark completed and award points
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());

        // Award points
        int pointsAwarded = step.getPoints() != null ? step.getPoints() : 0;
        int newTotal = (user.getTotalPoints() != null ? user.getTotalPoints() : 0) + pointsAwarded;
        user.setTotalPoints(newTotal);

        // Level up: level = 1 + (totalPoints / 100)
        int newLevel = 1 + (newTotal / 100);
        user.setLevel(newLevel);

        // Update rank
        user.setRank(calculateRank(newTotal));

        // Auto-award qualifying badges
        awardBadges(user);

        userRepository.save(user);
        return userProgressRepository.save(progress);
    }

    private String calculateRank(int totalPoints) {
        if (totalPoints >= 2500) return "MASTER";
        if (totalPoints >= 1000) return "EXPERT";
        if (totalPoints >= 500) return "ADVANCED";
        if (totalPoints >= 100) return "INTERMEDIATE";
        return "BEGINNER";
    }

    private void awardBadges(User user) {
        List<Badge> allBadges = badgeRepository.findAll();
        List<Badge> userBadges = user.getBadges();

        for (Badge badge : allBadges) {
            if (userBadges != null && userBadges.contains(badge)) {
                continue;
            }
            boolean meetsPoints = badge.getRequiredPoints() == null
                    || user.getTotalPoints() >= badge.getRequiredPoints();
            boolean meetsLevel = badge.getRequiredLevel() == null
                    || user.getLevel() >= badge.getRequiredLevel();

            if (meetsPoints && meetsLevel) {
                if (userBadges == null) {
                    user.setBadges(new java.util.ArrayList<>());
                    userBadges = user.getBadges();
                }
                userBadges.add(badge);
            }
        }
    }
}
