package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.service.InstructorStatisticsService;
import org.example.formation_service.web.dto.InstructorStatisticsResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InstructorStatisticsController {
    
    private final InstructorStatisticsService statisticsService;
    
    @GetMapping("/{instructorId}/statistics")
    public ResponseEntity<InstructorStatisticsResponse> getInstructorStatistics(
            @PathVariable Long instructorId) {
        
        log.info("GET /api/instructors/{}/statistics", instructorId);
        
        InstructorStatisticsResponse statistics = statisticsService.getInstructorStatistics(instructorId);
        
        return ResponseEntity.ok(statistics);
    }
}
