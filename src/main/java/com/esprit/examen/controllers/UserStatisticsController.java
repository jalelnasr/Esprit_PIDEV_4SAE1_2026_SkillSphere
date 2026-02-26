package com.esprit.examen.controllers;

import com.esprit.examen.dto.PlatformStatsResponse;
import com.esprit.examen.dto.UserStatsResponse;
import com.esprit.examen.services.UserStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Tag(name = "Statistics", description = "User dashboard and platform-wide analytics APIs")
public class UserStatisticsController {

    private final UserStatisticsService userStatisticsService;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get comprehensive statistics for a specific user (points, level, rank, completion rates, category breakdown)")
    public ResponseEntity<UserStatsResponse> getUserStats(@PathVariable Long userId) {
        return ResponseEntity.ok(userStatisticsService.getUserStats(userId));
    }

    @GetMapping("/platform")
    @Operation(summary = "Get platform-wide statistics (total users, labs, completions, distributions by rank and difficulty)")
    public ResponseEntity<PlatformStatsResponse> getPlatformStats() {
        return ResponseEntity.ok(userStatisticsService.getPlatformStats());
    }
}
