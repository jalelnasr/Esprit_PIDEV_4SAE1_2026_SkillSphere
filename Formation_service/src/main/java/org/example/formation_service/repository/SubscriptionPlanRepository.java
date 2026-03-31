package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findBySlug(String slug);
    List<SubscriptionPlan> findByIsActiveTrue();
}
