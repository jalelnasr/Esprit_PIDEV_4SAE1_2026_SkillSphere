package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.SubscriptionPlan;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.SubscriptionPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanService {
    
    private final SubscriptionPlanRepository planRepository;
    
    public List<SubscriptionPlan> getAllActivePlans() {
        return planRepository.findByIsActiveTrue();
    }
    
    public SubscriptionPlan getPlanById(Long id) {
        return planRepository.findById(id)
            .orElseThrow(() -> new BusinessException("PLAN_NOT_FOUND", "Plan not found with ID: " + id));
    }
    
    public SubscriptionPlan getPlanBySlug(String slug) {
        return planRepository.findBySlug(slug)
            .orElseThrow(() -> new BusinessException("PLAN_NOT_FOUND", "Plan not found with slug: " + slug));
    }
    
    @Transactional
    public SubscriptionPlan createPlan(SubscriptionPlan plan) {
        return planRepository.save(plan);
    }
    
    @Transactional
    public SubscriptionPlan updatePlan(Long id, SubscriptionPlan planDetails) {
        SubscriptionPlan plan = getPlanById(id);
        
        plan.setName(planDetails.getName());
        plan.setSlug(planDetails.getSlug());
        plan.setPriceMonthly(planDetails.getPriceMonthly());
        plan.setMonthlyEnrollmentLimit(planDetails.getMonthlyEnrollmentLimit());
        plan.setAccessLevel(planDetails.getAccessLevel());
        plan.setFeatures(planDetails.getFeatures());
        plan.setIsActive(planDetails.getIsActive());
        
        return planRepository.save(plan);
    }
}
