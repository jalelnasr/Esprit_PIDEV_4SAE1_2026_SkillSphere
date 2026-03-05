package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.SubscriptionPlan;
import org.example.formation_service.domain.entity.UserSubscription;
import org.example.formation_service.domain.enums.SubscriptionStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.UserSubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSubscriptionService {
    
    private final UserSubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanService planService;
    
    public UserSubscription getUserActiveSubscription(Long userId) {
        return subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
            .orElse(null);
    }
    
    public UserSubscription getSubscriptionById(Long id) {
        return subscriptionRepository.findById(id)
            .orElseThrow(() -> new BusinessException("SUBSCRIPTION_NOT_FOUND", "Subscription not found with ID: " + id));
    }
    
    public List<UserSubscription> getUserSubscriptions(Long userId) {
        return subscriptionRepository.findByUserId(userId);
    }
    
    @Transactional
    public UserSubscription createSubscriptionRequest(Long userId, String planSlug) {
        // Check if user already has an active or pending subscription
        UserSubscription existing = subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
            .orElse(null);
        if (existing != null) {
            throw new BusinessException("SUBSCRIPTION_EXISTS", "User already has an active subscription");
        }
        
        UserSubscription pending = subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.PENDING)
            .orElse(null);
        if (pending != null) {
            throw new BusinessException("PENDING_SUBSCRIPTION", "User already has a pending subscription request");
        }
        
        // Get the plan
        SubscriptionPlan plan = planService.getPlanBySlug(planSlug);
        
        // Create subscription with PENDING status
        UserSubscription subscription = UserSubscription.builder()
            .userId(userId)
            .plan(plan)
            .status(SubscriptionStatus.PENDING)
            .build();
        
        return subscriptionRepository.save(subscription);
    }
    
    @Transactional
    public void cancelSubscription(Long userId) {
        UserSubscription subscription = getUserActiveSubscription(userId);
        if (subscription == null) {
            throw new BusinessException("NO_ACTIVE_SUBSCRIPTION", "No active subscription found");
        }
        
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setCancelledAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);
    }
    
    @Transactional
    public void checkAndExpireSubscriptions(Long userId) {
        UserSubscription subscription = getUserActiveSubscription(userId);
        if (subscription != null && subscription.getEndDate() != null) {
            if (subscription.getEndDate().isBefore(LocalDateTime.now())) {
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(subscription);
            }
        }
    }
}
