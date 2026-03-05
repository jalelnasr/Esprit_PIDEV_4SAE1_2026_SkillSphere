package com.example.platformevaluationservice.evalution.repository;


import com.example.platformevaluationservice.evalution.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    List<Certificate> findByApprenantId(Long apprenantId);

}
