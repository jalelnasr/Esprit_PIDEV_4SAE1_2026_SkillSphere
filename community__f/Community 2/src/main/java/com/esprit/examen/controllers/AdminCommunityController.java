package com.esprit.examen.controllers;

import com.esprit.examen.dto.AdminActivityItemDTO;
import com.esprit.examen.dto.AdminCommunityStatsDTO;
import com.esprit.examen.dto.AdminPostDetailDTO;
import com.esprit.examen.dto.AdminPostListResponseDTO;
import com.esprit.examen.services.AdminCommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/community")
@Tag(name = "Admin Community", description = "Admin analytics and moderation read APIs")
@ConditionalOnProperty(name = "community.admin.enabled", havingValue = "true")
public class AdminCommunityController {

    @Resource
    private AdminCommunityService adminCommunityService;

    @GetMapping("/stats")
    @Operation(summary = "Get dynamic community stats for last 30 days")
    public ResponseEntity<AdminCommunityStatsDTO> getStats() {
        return ResponseEntity.ok(adminCommunityService.getStats());
    }

    @GetMapping("/recent-activities")
    @Operation(summary = "Get mixed recent community activity feed")
    public ResponseEntity<List<AdminActivityItemDTO>> getRecentActivities(
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(adminCommunityService.getRecentActivities(limit));
    }

    @GetMapping("/posts")
    @Operation(summary = "Get read-only community posts for admin")
    public ResponseEntity<AdminPostListResponseDTO> getPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminCommunityService.getPosts(page, size));
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "Get admin read-only details for a post")
    public ResponseEntity<AdminPostDetailDTO> getPostDetail(@PathVariable("id") Long postId) {
        return ResponseEntity.ok(adminCommunityService.getPostDetail(postId));
    }
}
