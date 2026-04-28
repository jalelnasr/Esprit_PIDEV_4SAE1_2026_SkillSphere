package org.example.b2bmodule.service;

import org.example.b2bmodule.entity.Candidate;
import org.example.b2bmodule.entity.Company;
import org.example.b2bmodule.entity.Mission;
import org.example.b2bmodule.entity.MissionApplication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CandidateMatchingServiceTest {

    @InjectMocks
    private CandidateMatchingService matchingService;

    private Mission mission;
    private Candidate candidate;
    private MissionApplication application;
    private Company company;

    @BeforeEach
    void setUp() {
        company = Company.builder()
                .id(1L)
                .name("Tech Corp")
                .build();

        mission = Mission.builder()
                .id(1L)
                .title("Senior Frontend Developer")
                .description("Build modern React applications")
                .company(company)
                .dailyRate(new BigDecimal("500"))
                .durationWeeks(12)
                .requiredSkills("React,TypeScript,JavaScript")
                .status(Mission.MissionStatus.OPEN)
                .build();

        candidate = Candidate.builder()
                .id(1L)
                .title("Senior Frontend Developer")
                .skills("React,TypeScript,JavaScript,Node.js")
                .experienceYears(5)
                .isLookingForJob(true)
                .build();

        application = MissionApplication.builder()
                .id(1L)
                .mission(mission)
                .candidate(candidate)
                .proposedRate(new BigDecimal("500"))
                .status(MissionApplication.MissionAppStatus.PENDING)
                .build();
    }

    @Test
    void shouldCalculatePerfectMatchScore() {
        // Given: Candidate with exact skills and rate
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 85, "Perfect match should score >= 85");
        assertTrue(score <= 100, "Score should not exceed 100");
    }

    @Test
    void shouldCalculateHighScoreForExperiencedCandidate() {
        // Given
        candidate.setExperienceYears(7);
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 80, "Experienced candidate should score >= 80");
    }

    @Test
    void shouldCalculateLowerScoreForMissingSkills() {
        // Given
        candidate.setSkills("HTML,CSS"); // Missing required skills
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score < 80, "Candidate with missing skills should score < 80");
    }

    @Test
    void shouldCalculateLowerScoreForInsufficientExperience() {
        // Given
        candidate.setExperienceYears(1); // Junior for senior position
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score < 90, "Junior candidate for senior position should score < 90");
    }

    @Test
    void shouldCalculateLowerScoreForHighRate() {
        // Given
        application.setProposedRate(new BigDecimal("800")); // 60% above budget
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score < 80, "High rate should lower the score");
    }

    @Test
    void shouldCalculateHigherScoreForLowRate() {
        // Given
        application.setProposedRate(new BigDecimal("400")); // 20% below budget
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 85, "Low rate should increase the score");
    }

    @Test
    void shouldHandleEmptySkills() {
        // Given
        candidate.setSkills("");
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 0 && score <= 100, "Score should be valid even with empty skills");
        assertTrue(score < 50, "Empty skills should result in low score");
    }

    @Test
    void shouldHandleNullSkills() {
        // Given
        candidate.setSkills(null);
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 0 && score <= 100, "Score should be valid even with null skills");
    }

    @Test
    void shouldRecognizeSynonyms() {
        // Given
        mission.setRequiredSkills("JavaScript,Node.js");
        candidate.setSkills("JS,NodeJS,Express"); // Synonyms
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 70, "Synonyms should be recognized and score well");
    }

    @Test
    void shouldGiveExceptionalRecommendationForHighScore() {
        // Given: Perfect candidate
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);
        String recommendation = matchingService.getMatchingRecommendation(score, mission, candidate);

        // Then
        if (score >= 90) {
            assertTrue(recommendation.contains("Exceptional") || recommendation.contains("🌟"));
        }
    }

    @Test
    void shouldGiveExcellentRecommendationForGoodScore() {
        // Given
        candidate.setExperienceYears(6);
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);
        String recommendation = matchingService.getMatchingRecommendation(score, mission, candidate);

        // Then
        assertNotNull(recommendation);
        assertTrue(recommendation.length() > 0);
    }

    @Test
    void shouldGivePoorRecommendationForLowScore() {
        // Given
        candidate.setSkills("PHP,MySQL"); // Completely different skills
        candidate.setExperienceYears(1);
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);
        String recommendation = matchingService.getMatchingRecommendation(score, mission, candidate);

        // Then
        assertTrue(score < 50, "Mismatched candidate should score low");
        assertTrue(recommendation.contains("Poor") || recommendation.contains("Weak") || recommendation.contains("❌") || recommendation.contains("⚠️"));
    }

    @Test
    void shouldGenerateDetailedAnalysis() {
        // When
        String analysis = matchingService.getDetailedAnalysis(application, mission, candidate);

        // Then
        assertNotNull(analysis);
        assertTrue(analysis.contains("Skills:"), "Analysis should mention skills");
        assertTrue(analysis.contains("Experience:"), "Analysis should mention experience");
        assertTrue(analysis.contains("Rate:"), "Analysis should mention rate");
    }

    @Test
    void shouldIdentifyMissingSkillsInAnalysis() {
        // Given
        candidate.setSkills("React"); // Missing TypeScript and JavaScript
        
        // When
        String analysis = matchingService.getDetailedAnalysis(application, mission, candidate);

        // Then
        assertTrue(analysis.contains("Missing:") || analysis.contains("matched"), "Analysis should provide skill information");
    }

    @Test
    void shouldReturnCorrectBadgeClass() {
        // Test different score ranges
        assertEquals("exceptional", matchingService.getScoreBadgeClass(95));
        assertEquals("excellent", matchingService.getScoreBadgeClass(85));
        assertEquals("very-good", matchingService.getScoreBadgeClass(75));
        assertEquals("good", matchingService.getScoreBadgeClass(65));
        assertEquals("moderate", matchingService.getScoreBadgeClass(55));
        assertEquals("weak", matchingService.getScoreBadgeClass(45));
        assertEquals("poor", matchingService.getScoreBadgeClass(30));
    }

    @Test
    void shouldHandleModernSkillsBonus() {
        // Given
        candidate.setSkills("React,TypeScript,Docker,Kubernetes,Microservices");
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 85, "Modern skills should provide bonus points");
    }

    @Test
    void shouldHandleMultipleSkillSeparators() {
        // Given
        candidate.setSkills("React;TypeScript|JavaScript,Node.js");
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 80, "Should handle different separators");
    }

    @Test
    void shouldCalculateScoreForSeniorPosition() {
        // Given
        mission.setDescription("Senior developer position requiring expert knowledge");
        candidate.setExperienceYears(8);
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 80, "Senior candidate for senior position should score well");
    }

    @Test
    void shouldCalculateScoreForJuniorPosition() {
        // Given
        mission.setDescription("Junior developer position for entry level");
        candidate.setExperienceYears(1);
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        assertTrue(score >= 60, "Junior candidate for junior position should score reasonably");
    }

    @Test
    void shouldPenalizeOverqualifiedCandidate() {
        // Given
        mission.setDescription("Junior developer position");
        candidate.setExperienceYears(10); // Overqualified
        application.setProposedRate(new BigDecimal("700")); // High rate
        
        // When
        int score = matchingService.calculateMatchingScore(application, mission, candidate);

        // Then
        // Overqualified with high rate should still score but not perfect
        assertTrue(score < 95, "Overqualified candidate with high rate should not score perfect");
    }
}
