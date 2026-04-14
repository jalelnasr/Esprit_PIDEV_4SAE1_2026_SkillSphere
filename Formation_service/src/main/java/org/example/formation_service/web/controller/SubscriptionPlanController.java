package org.example.formation_service.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.SubscriptionPlan;
import org.example.formation_service.service.SubscriptionPlanService;
import org.example.formation_service.web.dto.SubscriptionPlanResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/subscription-plans")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Plans d'abonnement", description = "Plans Basic / Plus / Premium — endpoint public, aucune auth requise")
public class SubscriptionPlanController {
    
    private final SubscriptionPlanService planService;
    
    @Operation(summary = "Lister les plans actifs", description = "Retourne tous les plans d'abonnement disponibles")
    @GetMapping
    public ResponseEntity<List<SubscriptionPlanResponse>> getAllActivePlans() {
        log.info("Fetching all active subscription plans");
        List<SubscriptionPlan> plans = planService.getAllActivePlans();
        List<SubscriptionPlanResponse> responses = plans.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionPlanResponse> getPlanById(@PathVariable Long id) {
        log.info("Fetching subscription plan with ID: {}", id);
        SubscriptionPlan plan = planService.getPlanById(id);
        return ResponseEntity.ok(toResponse(plan));
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<SubscriptionPlanResponse> getPlanBySlug(@PathVariable String slug) {
        log.info("Fetching subscription plan with slug: {}", slug);
        SubscriptionPlan plan = planService.getPlanBySlug(slug);
        return ResponseEntity.ok(toResponse(plan));
    }
    
    private SubscriptionPlanResponse toResponse(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
            .id(plan.getId())
            .name(plan.getName())
            .slug(plan.getSlug())
            .priceMonthly(plan.getPriceMonthly())
            .currency(plan.getCurrency())
            .monthlyEnrollmentLimit(plan.getMonthlyEnrollmentLimit())
            .accessLevel(plan.getAccessLevel())
            .features(plan.getFeatures())
            .isActive(plan.getIsActive())
            .build();
    }
}
