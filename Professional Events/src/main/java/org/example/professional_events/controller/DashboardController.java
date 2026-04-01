package org.example.professional_events.controller;

import org.example.professional_events.dto.CompetitionFilterDTO;
import org.example.professional_events.dto.DashboardStatsDTO;
import org.example.professional_events.entity.Competition;
import org.example.professional_events.security.JwtUtil;
import org.example.professional_events.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true", maxAge = 3600)
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Obtenir toutes les statistiques du dashboard pour le formateur
     * GET /api/dashboard/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }

            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            DashboardStatsDTO stats = dashboardService.getDashboardStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching dashboard stats: " + e.getMessage());
        }
    }

    /**
     * Filtrer et rechercher des compétitions
     * POST /api/dashboard/competitions/filter
     */
    @PostMapping("/competitions/filter")
    public ResponseEntity<?> filterCompetitions(
            @RequestBody CompetitionFilterDTO filter,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }

            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            List<Competition> competitions = dashboardService.filterCompetitions(filter, userId);
            return ResponseEntity.ok(competitions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error filtering competitions: " + e.getMessage());
        }
    }

    /**
     * Recherche rapide de compétitions par terme
     * GET /api/dashboard/competitions/search?q=term
     */
    @GetMapping("/competitions/search")
    public ResponseEntity<?> searchCompetitions(
            @RequestParam String q,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Authorization header");
            }

            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            List<Competition> competitions = dashboardService.searchCompetitions(q, userId);
            return ResponseEntity.ok(competitions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching competitions: " + e.getMessage());
        }
    }
}
