package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.PackPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PackPurchaseRepository extends JpaRepository<PackPurchase, Long> {
    List<PackPurchase> findByCompanyId(Long companyId);
    List<PackPurchase> findByPackId(Long packId);
}

