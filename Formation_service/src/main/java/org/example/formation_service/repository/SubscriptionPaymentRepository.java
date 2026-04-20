package org.example.formation_service.repository;

import org.example.formation_service.domain.entity.SubscriptionPayment;
import org.example.formation_service.domain.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, Long> {
    List<SubscriptionPayment> findByUserId(Long userId);
    List<SubscriptionPayment> findByPaymentStatus(PaymentStatus status);
}
