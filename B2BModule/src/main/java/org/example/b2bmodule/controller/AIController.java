package org.example.b2bmodule.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.b2bmodule.ai.AIMatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for AI features
 */
@RestController
@RequestMapping("/api/b2b/ai")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(originPatterns = "*", allowCredentials = "false")
public class AIController {

    private final AIMatchingService aiMatchingService;

    /**
     * Calculate matching score between a candidate and a mission
     * 
     * @param candidateSkills Candidate skills (e.g., "Java, Spring, MySQL")
     * @param candidateExperience Candidate years of experience
     * @param missionSkills Required skills for the mission
     * @param missionExperience Required experience for the mission
     * @param proposedRate Daily rate proposed by candidate
     * @param missionBudget Mission budget
     * @return Matching score and AI recommendation
     */
    @GetMapping("/match-score")
    public ResponseEntity<Map<String, Object>> calculateMatchScore(
            @RequestParam String candidateSkills,
            @RequestParam int candidateExperience,
            @RequestParam String missionSkills,
            @RequestParam int missionExperience,
            @RequestParam BigDecimal proposedRate,
            @RequestParam BigDecimal missionBudget
    ) {
        log.info("🤖 AI API - Calculating matching score");
        
        int score = aiMatchingService.calculateMatchScore(
            candidateSkills,
            candidateExperience,
            missionSkills,
            missionExperience,
            proposedRate,
            missionBudget
        );
        
        String level = aiMatchingService.getMatchLevel(score);
        String recommendation = aiMatchingService.generateRecommendation(score);
        
        Map<String, Object> response = new HashMap<>();
        response.put("score", score);
        response.put("level", level);
        response.put("recommendation", recommendation);
        response.put("details", Map.of(
            "candidateSkills", candidateSkills,
            "candidateExperience", candidateExperience,
            "missionSkills", missionSkills,
            "missionExperience", missionExperience,
            "proposedRate", proposedRate,
            "missionBudget", missionBudget
        ));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get AI recommendation based on a score
     */
    @GetMapping("/recommendation/{score}")
    public ResponseEntity<Map<String, String>> getRecommendation(@PathVariable int score) {
        log.info("🤖 AI API - Generating recommendation for score: {}", score);
        
        String level = aiMatchingService.getMatchLevel(score);
        String recommendation = aiMatchingService.generateRecommendation(score);
        
        Map<String, String> response = new HashMap<>();
        response.put("score", String.valueOf(score));
        response.put("level", level);
        response.put("recommendation", recommendation);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint to verify AI is working
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "🤖 AI Module operational");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }
}
