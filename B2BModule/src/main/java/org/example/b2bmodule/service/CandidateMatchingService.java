package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.entity.Candidate;
import org.example.b2bmodule.entity.Mission;
import org.example.b2bmodule.entity.MissionApplication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateMatchingService {

    // Dictionnaire de synonymes pour les compétences
    private static final Map<String, Set<String>> SKILL_SYNONYMS = Map.of(
        "javascript", Set.of("js", "node", "nodejs", "react", "vue", "angular"),
        "java", Set.of("spring", "springboot", "hibernate", "maven", "gradle"),
        "python", Set.of("django", "flask", "fastapi", "pandas", "numpy"),
        "database", Set.of("sql", "mysql", "postgresql", "mongodb", "oracle"),
        "cloud", Set.of("aws", "azure", "gcp", "docker", "kubernetes"),
        "frontend", Set.of("html", "css", "react", "vue", "angular", "typescript"),
        "backend", Set.of("api", "rest", "microservices", "spring", "express"),
        "mobile", Set.of("android", "ios", "flutter", "react native", "kotlin", "swift")
    );

    // Compétences critiques qui ont plus de poids
    private static final Set<String> CRITICAL_SKILLS = Set.of(
        "java", "python", "javascript", "react", "spring", "aws", "docker", "sql"
    );

    /**
     * Calcule le score de matching avancé entre un candidat et une mission (0-100)
     * 
     * Critères améliorés :
     * - Compétences techniques (45%) : Matching intelligent avec synonymes
     * - Expérience (25%) : Analyse contextuelle de l'expérience
     * - Taux proposé (20%) : Évaluation économique
     * - Facteurs bonus (10%) : Compétences rares, polyvalence, etc.
     */
    public int calculateMatchingScore(MissionApplication application, Mission mission, Candidate candidate) {
        double skillsScore = calculateAdvancedSkillsScore(mission, candidate);
        double experienceScore = calculateContextualExperienceScore(mission, candidate);
        double rateScore = calculateSmartRateScore(application, mission);
        double bonusScore = calculateBonusFactors(mission, candidate);
        
        // Pondération améliorée : Compétences 45%, Expérience 25%, Taux 20%, Bonus 10%
        double totalScore = (skillsScore * 0.45) + (experienceScore * 0.25) + (rateScore * 0.20) + (bonusScore * 0.10);
        
        return Math.min(100, (int) Math.round(totalScore));
    }

    /**
     * Calcul avancé du score de compétences avec intelligence artificielle
     */
    private double calculateAdvancedSkillsScore(Mission mission, Candidate candidate) {
        Set<String> requiredSkills = parseSkills(mission.getRequiredSkills());
        Set<String> candidateSkills = parseSkills(candidate.getSkills());
        
        if (requiredSkills.isEmpty()) {
            return 100.0;
        }
        
        double totalScore = 0.0;
        int criticalMatches = 0;
        int totalCritical = 0;
        
        for (String required : requiredSkills) {
            boolean isCritical = CRITICAL_SKILLS.contains(required.toLowerCase());
            if (isCritical) totalCritical++;
            
            double skillMatch = calculateSingleSkillMatch(required, candidateSkills);
            
            if (isCritical) {
                totalScore += skillMatch * 1.5; // Bonus pour compétences critiques
                if (skillMatch > 0.7) criticalMatches++;
            } else {
                totalScore += skillMatch;
            }
        }
        
        // Score de base
        double baseScore = (totalScore / requiredSkills.size()) * 100;
        
        // Bonus si toutes les compétences critiques sont couvertes
        if (totalCritical > 0 && criticalMatches == totalCritical) {
            baseScore += 10;
        }
        
        return Math.min(100.0, baseScore);
    }

    /**
     * Calcule le matching d'une compétence spécifique avec intelligence
     */
    private double calculateSingleSkillMatch(String required, Set<String> candidateSkills) {
        String reqLower = required.toLowerCase();
        
        // Match exact
        if (candidateSkills.contains(reqLower)) {
            return 1.0;
        }
        
        // Match partiel direct
        for (String candidateSkill : candidateSkills) {
            if (candidateSkill.contains(reqLower) || reqLower.contains(candidateSkill)) {
                return 0.9;
            }
        }
        
        // Match via synonymes
        for (Map.Entry<String, Set<String>> entry : SKILL_SYNONYMS.entrySet()) {
            if (entry.getValue().contains(reqLower) || entry.getKey().equals(reqLower)) {
                for (String synonym : entry.getValue()) {
                    if (candidateSkills.contains(synonym)) {
                        return 0.8;
                    }
                }
                if (candidateSkills.contains(entry.getKey())) {
                    return 0.8;
                }
            }
        }
        
        // Match par similarité de mots
        for (String candidateSkill : candidateSkills) {
            if (calculateStringSimilarity(reqLower, candidateSkill) > 0.7) {
                return 0.6;
            }
        }
        
        return 0.0;
    }

    /**
     * Calcule la similarité entre deux chaînes (algorithme de Levenshtein simplifié)
     */
    private double calculateStringSimilarity(String s1, String s2) {
        int maxLen = Math.max(s1.length(), s2.length());
        if (maxLen == 0) return 1.0;
        
        int distance = calculateLevenshteinDistance(s1, s2);
        return 1.0 - (double) distance / maxLen;
    }

    /**
     * Distance de Levenshtein simplifiée
     */
    private int calculateLevenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1),
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1)
                    );
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }

    /**
     * Calcul contextuel de l'expérience basé sur la mission
     */
    private double calculateContextualExperienceScore(Mission mission, Candidate candidate) {
        int years = candidate.getExperienceYears();
        
        // Analyse du niveau requis basé sur la mission
        int requiredLevel = estimateRequiredExperienceLevel(mission);
        
        if (years >= requiredLevel) {
            // Expérience suffisante ou supérieure
            if (years > requiredLevel + 3) {
                return 95.0; // Senior avec beaucoup d'expérience
            } else if (years > requiredLevel) {
                return 90.0; // Expérience légèrement supérieure
            } else {
                return 85.0; // Expérience exacte
            }
        } else {
            // Expérience insuffisante mais peut être compensée
            int gap = requiredLevel - years;
            if (gap == 1) {
                return 70.0; // Manque 1 an
            } else if (gap == 2) {
                return 55.0; // Manque 2 ans
            } else {
                return Math.max(30.0, 80.0 - (gap * 15)); // Pénalité progressive
            }
        }
    }

    /**
     * Estime le niveau d'expérience requis basé sur la mission
     */
    private int estimateRequiredExperienceLevel(Mission mission) {
        String description = (mission.getDescription() + " " + mission.getRequiredSkills()).toLowerCase();
        
        if (description.contains("senior") || description.contains("lead") || description.contains("architect")) {
            return 5;
        } else if (description.contains("expert") || description.contains("advanced")) {
            return 4;
        } else if (description.contains("intermediate") || description.contains("confirmed")) {
            return 3;
        } else if (description.contains("junior") || description.contains("entry")) {
            return 1;
        } else {
            return 2; // Niveau par défaut
        }
    }

    /**
     * Calcul intelligent du score de taux
     */
    private double calculateSmartRateScore(MissionApplication application, Mission mission) {
        BigDecimal proposedRate = application.getProposedRate();
        BigDecimal missionRate = mission.getDailyRate();
        
        if (proposedRate.compareTo(missionRate) == 0) {
            return 100.0;
        }
        
        BigDecimal difference = proposedRate.subtract(missionRate)
            .divide(missionRate, 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));
        
        double diffPercent = difference.doubleValue();
        
        // Logique améliorée pour l'évaluation des taux
        if (diffPercent <= -10) {
            return 100.0; // Taux très avantageux
        } else if (diffPercent <= 0) {
            return 95.0; // Taux avantageux
        } else if (diffPercent <= 5) {
            return 90.0; // Taux légèrement supérieur mais acceptable
        } else if (diffPercent <= 15) {
            return 75.0; // Taux modérément supérieur
        } else if (diffPercent <= 25) {
            return 60.0; // Taux élevé mais négociable
        } else if (diffPercent <= 40) {
            return 40.0; // Taux très élevé
        } else {
            return 20.0; // Taux excessif
        }
    }

    /**
     * Calcule des facteurs bonus pour améliorer le score
     */
    private double calculateBonusFactors(Mission mission, Candidate candidate) {
        double bonus = 0.0;
        
        Set<String> candidateSkills = parseSkills(candidate.getSkills());
        Set<String> requiredSkills = parseSkills(mission.getRequiredSkills());
        
        // Bonus pour polyvalence (plus de compétences que requis)
        if (candidateSkills.size() > requiredSkills.size() * 1.5) {
            bonus += 20.0;
        }
        
        // Bonus pour compétences rares/modernes
        Set<String> modernSkills = Set.of("kubernetes", "docker", "microservices", "react", "vue", "flutter", "tensorflow");
        long modernSkillCount = candidateSkills.stream()
            .filter(skill -> modernSkills.stream().anyMatch(modern -> skill.contains(modern)))
            .count();
        
        if (modernSkillCount >= 2) {
            bonus += 15.0;
        } else if (modernSkillCount >= 1) {
            bonus += 10.0;
        }
        
        // Bonus pour expérience élevée
        if (candidate.getExperienceYears() >= 7) {
            bonus += 10.0;
        }
        
        return Math.min(100.0, bonus);
    }

    /**
     * Parse une chaîne de compétences avec nettoyage avancé
     */
    private Set<String> parseSkills(String skillsStr) {
        if (skillsStr == null || skillsStr.trim().isEmpty()) {
            return Collections.emptySet();
        }
        
        return Arrays.stream(skillsStr.split("[,;|]")) // Support de plusieurs séparateurs
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(s -> s.toLowerCase().replaceAll("[^a-zA-Z0-9\\s+#]", "")) // Nettoyage
            .filter(s -> s.length() > 1) // Éviter les compétences trop courtes
            .collect(Collectors.toSet());
    }

    /**
     * Génère une recommandation textuelle intelligente basée sur l'analyse
     */
    public String getMatchingRecommendation(int score, Mission mission, Candidate candidate) {
        if (score >= 90) {
            return "🌟 Exceptional match - Perfect candidate for this mission";
        } else if (score >= 80) {
            return "⭐ Excellent match - Highly recommended candidate";
        } else if (score >= 70) {
            return "✅ Very good match - Strong candidate to consider";
        } else if (score >= 60) {
            return "👍 Good match - Solid candidate worth interviewing";
        } else if (score >= 50) {
            return "⚖️ Moderate match - Consider with additional evaluation";
        } else if (score >= 40) {
            return "⚠️ Weak match - Requires thorough assessment";
        } else {
            return "❌ Poor match - Not recommended for this mission";
        }
    }

    /**
     * Génère une analyse détaillée du matching
     */
    public String getDetailedAnalysis(MissionApplication application, Mission mission, Candidate candidate) {
        StringBuilder analysis = new StringBuilder();
        
        // Analyse des compétences
        Set<String> requiredSkills = parseSkills(mission.getRequiredSkills());
        Set<String> candidateSkills = parseSkills(candidate.getSkills());
        
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        
        for (String required : requiredSkills) {
            if (calculateSingleSkillMatch(required, candidateSkills) > 0.7) {
                matchedSkills.add(required);
            } else {
                missingSkills.add(required);
            }
        }
        
        analysis.append("Skills: ").append(matchedSkills.size()).append("/").append(requiredSkills.size()).append(" matched");
        
        if (!missingSkills.isEmpty()) {
            analysis.append(" | Missing: ").append(String.join(", ", missingSkills));
        }
        
        // Analyse de l'expérience
        int requiredExp = estimateRequiredExperienceLevel(mission);
        analysis.append(" | Experience: ").append(candidate.getExperienceYears()).append(" years");
        
        if (candidate.getExperienceYears() < requiredExp) {
            analysis.append(" (needs ").append(requiredExp - candidate.getExperienceYears()).append(" more)");
        }
        
        // Analyse du taux
        BigDecimal diff = application.getProposedRate().subtract(mission.getDailyRate());
        if (diff.compareTo(BigDecimal.ZERO) > 0) {
            analysis.append(" | Rate: +").append(diff).append("€ above budget");
        } else if (diff.compareTo(BigDecimal.ZERO) < 0) {
            analysis.append(" | Rate: ").append(diff).append("€ under budget");
        } else {
            analysis.append(" | Rate: Exact match");
        }
        
        return analysis.toString();
    }

    /**
     * Retourne la classe CSS pour le badge de score avec plus de nuances
     */
    public String getScoreBadgeClass(int score) {
        if (score >= 90) return "exceptional";
        if (score >= 80) return "excellent";
        if (score >= 70) return "very-good";
        if (score >= 60) return "good";
        if (score >= 50) return "moderate";
        if (score >= 40) return "weak";
        return "poor";
    }
}
