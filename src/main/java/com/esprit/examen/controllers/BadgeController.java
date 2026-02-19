package com.esprit.examen.controllers;

import com.esprit.examen.entities.Badge;
import com.esprit.examen.services.BadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@Tag(name = "Badge", description = "Badge management APIs")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    @PostMapping
    @Operation(summary = "Create a new badge")
    public ResponseEntity<Badge> createBadge(@RequestBody Badge badge) {
        return ResponseEntity.ok(badgeService.createBadge(badge));
    }

    @GetMapping
    @Operation(summary = "Get all badges")
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a badge by ID")
    public ResponseEntity<Badge> getBadgeById(@PathVariable Long id) {
        return ResponseEntity.ok(badgeService.getBadgeById(id));
    }

    @GetMapping("/points/{points}")
    @Operation(summary = "Get badges achievable with given points")
    public ResponseEntity<List<Badge>> getBadgesByMaxPoints(@PathVariable Integer points) {
        return ResponseEntity.ok(badgeService.getBadgesByMaxPoints(points));
    }

    @GetMapping("/level/{level}")
    @Operation(summary = "Get badges achievable at given level")
    public ResponseEntity<List<Badge>> getBadgesByMaxLevel(@PathVariable Integer level) {
        return ResponseEntity.ok(badgeService.getBadgesByMaxLevel(level));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a badge by ID")
    public ResponseEntity<Badge> updateBadge(@PathVariable Long id, @RequestBody Badge badge) {
        return ResponseEntity.ok(badgeService.updateBadge(id, badge));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a badge by ID")
    public ResponseEntity<Void> deleteBadge(@PathVariable Long id) {
        badgeService.deleteBadge(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{badgeId}/user/{userId}")
    @Operation(summary = "Assign a badge to a user")
    public ResponseEntity<Void> assignBadgeToUser(@PathVariable Long badgeId, @PathVariable Long userId) {
        badgeService.assignBadgeToUser(badgeId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{badgeId}/user/{userId}")
    @Operation(summary = "Remove a badge from a user")
    public ResponseEntity<Void> removeBadgeFromUser(@PathVariable Long badgeId, @PathVariable Long userId) {
        badgeService.removeBadgeFromUser(badgeId, userId);
        return ResponseEntity.ok().build();
    }
}