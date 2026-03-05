package org.example.formation_service.web.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.SubscriptionPlan;
import org.example.formation_service.domain.entity.UserSubscription;
import org.example.formation_service.service.PaymentService;
import org.example.formation_service.service.UserSubscriptionService;
import org.example.formation_service.web.dto.SubscriptionPlanResponse;
import org.example.formation_service.web.dto.UserSubscriptionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class UserSubscriptionController {
    
    private final UserSubscriptionService subscriptionService;
    private final PaymentService paymentService;
    
    @GetMapping("/me")
    public ResponseEntity<UserSubscriptionResponse> getMySubscription(@RequestHeader("X-User-Id") Long userId) {
        log.info("Fetching subscription for user: {}", userId);
        
        // Check and expire if needed
        subscriptionService.checkAndExpireSubscriptions(userId);
        
        UserSubscription subscription = subscriptionService.getUserActiveSubscription(userId);
        if (subscription == null) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(toResponse(subscription));
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<UserSubscriptionResponse> requestSubscription(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String planSlug) {
        log.info("User {} requesting subscription to plan: {}", userId, planSlug);
        
        // Create subscription request
        UserSubscription subscription = subscriptionService.createSubscriptionRequest(userId, planSlug);
        
        // Create payment request
        paymentService.createPaymentRequest(
            subscription.getId(),
            userId,
            subscription.getPlan().getPriceMonthly()
        );
        
        log.info("Subscription request created with ID: {}", subscription.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(subscription));
    }
    
    @PostMapping("/cancel")
    public ResponseEntity<Void> cancelSubscription(@RequestHeader("X-User-Id") Long userId) {
        log.info("User {} cancelling subscription", userId);
        subscriptionService.cancelSubscription(userId);
        return ResponseEntity.noContent().build();
    }
    
    private UserSubscriptionResponse toResponse(UserSubscription subscription) {
        return UserSubscriptionResponse.builder()
            .id(subscription.getId())
            .userId(subscription.getUserId())
            .plan(toPlanResponse(subscription.getPlan()))
            .status(subscription.getStatus())
            .startDate(subscription.getStartDate())
            .endDate(subscription.getEndDate())
            .createdAt(subscription.getCreatedAt())
            .build();
    }
    
    private SubscriptionPlanResponse toPlanResponse(SubscriptionPlan plan) {
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
