package com.esprit.examen.controllers;

import com.esprit.examen.dto.LeaderboardEntry;
import com.esprit.examen.services.LeaderboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@Tag(name = "Leaderboard", description = "Global rankings and competitive leaderboard APIs")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    @Operation(summary = "Get full global leaderboard sorted by points (descending)")
    public ResponseEntity<List<LeaderboardEntry>> getGlobalLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard());
    }

    @GetMapping("/top/{n}")
    @Operation(summary = "Get top N users on the leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getTopN(@PathVariable int n) {
        return ResponseEntity.ok(leaderboardService.getTopN(n));
    }

    @GetMapping("/rank/{rank}")
    @Operation(summary = "Get leaderboard filtered by rank (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, MASTER)")
    public ResponseEntity<List<LeaderboardEntry>> getByRank(@PathVariable String rank) {
        return ResponseEntity.ok(leaderboardService.getLeaderboardByRank(rank));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get a specific user's leaderboard position and stats")
    public ResponseEntity<LeaderboardEntry> getUserPosition(@PathVariable Long userId) {
        return ResponseEntity.ok(leaderboardService.getUserPosition(userId));
    }
}
