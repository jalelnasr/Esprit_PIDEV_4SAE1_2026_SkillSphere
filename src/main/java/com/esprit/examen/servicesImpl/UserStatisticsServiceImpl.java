package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.PlatformStatsResponse;
import com.esprit.examen.dto.UserStatsResponse;
import com.esprit.examen.entities.*;
import com.esprit.examen.exceptions.ResourceNotFoundException;
import com.esprit.examen.repositories.*;
import com.esprit.examen.services.UserStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserStatisticsServiceImpl implements UserStatisticsService {

    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;
    private final LabInstanceRepository labInstanceRepository;
    private final LabRepository labRepository;
    private final LabCategoryRepository labCategoryRepository;
    private final LabStepRepository labStepRepository;
    private final BadgeRepository badgeRepository;
    private final LabReviewRepository labReviewRepository;

    @Override
    public UserStatsResponse getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<UserProgress> allProgress = userProgressRepository.findByUserIdUser(userId);
        List<UserProgress> completed = allProgress.stream()
                .filter(p -> Boolean.TRUE.equals(p.getCompleted()))
                .toList();

        long totalAttempts = allProgress.stream()
                .mapToInt(p -> p.getAttempts() != null ? p.getAttempts() : 0)
                .sum();

        // Count distinct completed labs (where all steps are done)
        Set<Long> completedLabIds = completed.stream()
                .filter(p -> p.getLabStep() != null && p.getLabStep().getLab() != null)
                .map(p -> p.getLabStep().getLab().getLabId())
                .collect(Collectors.toSet());

        long fullyCompletedLabs = 0;
        for (Long labId : completedLabIds) {
            long totalSteps = labStepRepository.findByLabLabId(labId).size();
            long completedSteps = completed.stream()
                    .filter(p -> p.getLabStep() != null
                            && p.getLabStep().getLab() != null
                            && p.getLabStep().getLab().getLabId().equals(labId))
                    .count();
            if (totalSteps > 0 && completedSteps >= totalSteps) {
                fullyCompletedLabs++;
            }
        }

        // Active lab instances
        long activeLabs = labInstanceRepository.findByUserIdUserAndStatus(userId, "RUNNING").size();

        // Badges
        long badges = user.getBadges() != null ? user.getBadges().size() : 0;

        // Reviews stats
        List<LabReview> userReviews = labReviewRepository.findByUserIdUserOrderByCreatedAtDesc(userId);
        Double avgRating = userReviews.isEmpty() ? 0.0 :
                userReviews.stream().mapToInt(LabReview::getRating).average().orElse(0.0);

        // Category breakdown
        List<LabCategory> categories = labCategoryRepository.findAll();
        List<UserStatsResponse.CategoryProgress> breakdown = new ArrayList<>();
        for (LabCategory cat : categories) {
            List<Lab> labs = labRepository.findByCategoryCategoryId(cat.getCategoryId());
            long totalStepsInCat = 0;
            long completedStepsInCat = 0;

            for (Lab lab : labs) {
                List<LabStep> steps = labStepRepository.findByLabLabId(lab.getLabId());
                totalStepsInCat += steps.size();
                for (LabStep step : steps) {
                    boolean done = completed.stream()
                            .anyMatch(p -> p.getLabStep() != null
                                    && p.getLabStep().getStepId().equals(step.getStepId()));
                    if (done) completedStepsInCat++;
                }
            }

            double pct = totalStepsInCat > 0 ? Math.round((completedStepsInCat * 100.0 / totalStepsInCat) * 100.0) / 100.0 : 0.0;
            breakdown.add(new UserStatsResponse.CategoryProgress(
                    cat.getCategoryId(),
                    cat.getName(),
                    totalStepsInCat,
                    completedStepsInCat,
                    pct
            ));
        }

        return new UserStatsResponse(
                user.getIdUser(),
                user.getNom(),
                user.getPrenom(),
                user.getTotalPoints(),
                user.getLevel(),
                user.getRank(),
                (long) completed.size(),
                totalAttempts,
                fullyCompletedLabs,
                activeLabs,
                badges,
                (long) userReviews.size(),
                Math.round(avgRating * 100.0) / 100.0,
                breakdown
        );
    }

    @Override
    public PlatformStatsResponse getPlatformStats() {
        List<User> allUsers = userRepository.findAll();

        // Users by rank
        Map<String, Long> usersByRank = allUsers.stream()
                .collect(Collectors.groupingBy(
                        u -> u.getRank() != null ? u.getRank() : "BEGINNER",
                        Collectors.counting()
                ));

        // Labs by difficulty
        List<Lab> allLabs = labRepository.findAll();
        Map<String, Long> labsByDifficulty = allLabs.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getDifficulty() != null ? l.getDifficulty() : "UNKNOWN",
                        Collectors.counting()
                ));

        // Platform average points
        double avgPoints = allUsers.stream()
                .mapToInt(u -> u.getTotalPoints() != null ? u.getTotalPoints() : 0)
                .average()
                .orElse(0.0);

        // Total completed steps across platform
        long totalCompleted = userProgressRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getCompleted()))
                .count();

        return new PlatformStatsResponse(
                (long) allUsers.size(),
                (long) allLabs.size(),
                labCategoryRepository.count(),
                badgeRepository.count(),
                labReviewRepository.count(),
                totalCompleted,
                labInstanceRepository.count(),
                usersByRank,
                labsByDifficulty,
                Math.round(avgPoints * 100.0) / 100.0
        );
    }
}
