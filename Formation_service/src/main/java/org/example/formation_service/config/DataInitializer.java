package org.example.formation_service.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.formation_service.domain.entity.SubscriptionPlan;
import org.example.formation_service.domain.enums.AccessLevel;
import org.example.formation_service.repository.SubscriptionPlanRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final SubscriptionPlanRepository planRepository;
    
    @Override
    public void run(String... args) {
        initializeSubscriptionPlans();
    }
    
    private void initializeSubscriptionPlans() {
        // Check if plans already exist
        if (planRepository.count() > 0) {
            log.info("Subscription plans already initialized");
            return;
        }
        
        log.info("Initializing subscription plans...");
        
        // Basic Plan
        SubscriptionPlan basic = SubscriptionPlan.builder()
            .name("Basic")
            .slug("basic")
            .priceMonthly(new BigDecimal("25.00"))
            .currency("DT")
            .monthlyEnrollmentLimit(5)
            .accessLevel(AccessLevel.BASIC)
            .features("[\"Accès aux cours débutants\", \"Certificats basiques\", \"Ressources téléchargeables\", \"Support par email\", \"Accès au forum communautaire\"]")
            .isActive(true)
            .build();
        planRepository.save(basic);
        
        // Plus Plan
        SubscriptionPlan plus = SubscriptionPlan.builder()
            .name("Plus")
            .slug("plus")
            .priceMonthly(new BigDecimal("45.00"))
            .currency("DT")
            .monthlyEnrollmentLimit(15)
            .accessLevel(AccessLevel.PLUS)
            .features("[\"Accès aux cours débutants et intermédiaires\", \"Certificats professionnels\", \"Ressources téléchargeables\", \"Sessions en direct\", \"Support prioritaire\", \"Accès complet au forum\"]")
            .isActive(true)
            .build();
        planRepository.save(plus);
        
        // Premium Plan
        SubscriptionPlan premium = SubscriptionPlan.builder()
            .name("Premium")
            .slug("premium")
            .priceMonthly(new BigDecimal("75.00"))
            .currency("DT")
            .monthlyEnrollmentLimit(null)  // Unlimited
            .accessLevel(AccessLevel.PREMIUM)
            .features("[\"Accès à tous les cours\", \"Inscriptions illimitées\", \"Certificats professionnels\", \"Sessions en direct\", \"Support prioritaire\", \"Recommandations de parcours\", \"Analyses de progression\", \"Accès anticipé aux nouveaux cours\"]")
            .isActive(true)
            .build();
        planRepository.save(premium);
        
        log.info("Subscription plans initialized successfully: Basic, Plus, Premium");
    }
}
