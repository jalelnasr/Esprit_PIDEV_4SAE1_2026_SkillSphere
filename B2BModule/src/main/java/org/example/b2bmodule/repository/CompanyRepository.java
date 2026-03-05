package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCreatedBy(Long userId);
    List<Company> findBySectorContainingIgnoreCase(String sector);
    Optional<Company> findBySiret(String siret);
    boolean existsBySiret(String siret);
}

