package org.example.b2bmodule.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * AI Service for intelligent candidate/mission matching
 * Uses machine learning algorithms to calculate compatibility
 */
@Service
@Slf4j
public class AIMatchingService {

    /**
     * Calculate matching score between a candidate and a mission
     * @return Score between 0 and 100
     */
    public int calculateMatchScore(
            String candidateSkills,
            int candidateExperience,
            String missionRequiredSkills,
            int missionRequiredExperience,
            BigDecimal proposedRate,
            BigDecimal missionBudget
    ) {
        log.info("🤖 AI - Calculating matching score...");
        
        // 1. Skills score (40% of total score)
        double skillsScore = calculateSkillsMatch(candidateSkills, missionRequiredSkills);
        log.info("📊 Skills score: {}/40", skillsScore);
        
        // 2. Experience score (30% of total score)
        double experienceScore = calculateExperienceMatch(candidateExperience, missionRequiredExperience);
        log.info("📊 Experience score: {}/30", experienceScore);
        
        // 3. Daily rate score (30% of total score)
        double rateScore = calculateRateMatch(proposedRate, missionBudget);
        log.info("📊 Rate score: {}/30", rateScore);
        
        // Total score
        int totalScore = (int) Math.round(skillsScore + experienceScore + rateScore);
        log.info("🎯 Total matching score: {}/100", totalScore);
        
        return totalScore;
    }

    /**
     * Calculate skills matching score (Jaccard algorithm)
     * @return Score between 0 and 40
     */
    private double calculateSkillsMatch(String candidateSkills, String missionSkills) {
        if (candidateSkills == null || missionSkills == null) {
            return 0.0;
        }
        
        // Normalization and tokenization
        Set<String> candidateSet = tokenizeSkills(candidateSkills.toLowerCase());
        Set<String> missionSet = tokenizeSkills(missionSkills.toLowerCase());
        
        if (missionSet.isEmpty()) {
            return 40.0; // If no required skills, max score
        }
        
        // Calculate intersection (common skills)
        Set<String> intersection = new HashSet<>(candidateSet);
        intersection.retainAll(missionSet);
        
        // Calculate union
        Set<String> union = new HashSet<>(candidateSet);
        union.addAll(missionSet);
        
        // Jaccard coefficient: |intersection| / |union|
        double jaccardCoefficient = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
        
        // Score out of 40 points
        return jaccardCoefficient * 40.0;
    }

    /**
     * Tokenize skills into keywords
     */
    private Set<String> tokenizeSkills(String skills) {
        Set<String> tokens = new HashSet<>();
        
        // Split by commas, semicolons, spaces
        String[] parts = skills.split("[,;\\s]+");
        
        for (String part : parts) {
            String cleaned = part.trim();
            if (!cleaned.isEmpty()) {
                tokens.add(cleaned);
            }
        }
        
        return tokens;
    }

    /**
     * Calculate experience matching score
     * @return Score between 0 and 30
     */
    private double calculateExperienceMatch(int candidateExp, int requiredExp) {
        if (requiredExp == 0) {
            return 30.0; // If no experience required, max score
        }
        
        if (candidateExp >= requiredExp) {
            // Candidate has required experience or more
            // Bonus for exact match, slight penalty for overqualification
            int diff = candidateExp - requiredExp;
            if (diff == 0) {
                return 30.0; // Perfect
            } else if (diff <= 2) {
                return 28.0; // Very good
            } else if (diff <= 5) {
                return 25.0; // Good (possibly overqualified)
            } else {
                return 20.0; // Overqualified
            }
        } else {
            // Candidate has less experience than required
            double ratio = (double) candidateExp / requiredExp;
            return ratio * 30.0; // Proportional score
        }
    }

    /**
     * Calculate daily rate matching score
     * @return Score between 0 and 30
     */
    private double calculateRateMatch(BigDecimal proposedRate, BigDecimal budget) {
        if (budget == null || budget.compareTo(BigDecimal.ZERO) == 0) {
            return 30.0; // If no budget defined, max score
        }
        
        if (proposedRate == null) {
            return 15.0; // Average score if no rate proposed
        }
        
        // Calculate ratio
        double ratio = proposedRate.divide(budget, 4, BigDecimal.ROUND_HALF_UP).doubleValue();
        
        if (ratio <= 0.8) {
            // Proposed rate <= 80% of budget: excellent
            return 30.0;
        } else if (ratio <= 1.0) {
            // Proposed rate between 80% and 100% of budget: very good
            return 25.0;
        } else if (ratio <= 1.2) {
            // Proposed rate between 100% and 120% of budget: acceptable
            return 15.0;
        } else if (ratio <= 1.5) {
            // Proposed rate between 120% and 150% of budget: borderline
            return 5.0;
        } else {
            // Proposed rate > 150% of budget: too expensive
            return 0.0;
        }
    }

    /**
     * Determine compatibility level based on score
     */
    public String getMatchLevel(int score) {
        if (score >= 80) {
            return "EXCELLENT";
        } else if (score >= 60) {
            return "GOOD";
        } else if (score >= 40) {
            return "AVERAGE";
        } else {
            return "LOW";
        }
    }

    /**
     * Generate AI recommendation based on score
     */
    public String generateRecommendation(int score) {
        if (score >= 80) {
            return "🌟 Highly recommended candidate! Profile perfectly aligned with the mission.";
        } else if (score >= 60) {
            return "✅ Good candidate. Compatible profile with some possible adjustments.";
        } else if (score >= 40) {
            return "⚠️ Acceptable candidate. Verify key skills before validation.";
        } else {
            return "❌ Low compatibility. Candidate not well suited for this mission.";
        }
    }
}
