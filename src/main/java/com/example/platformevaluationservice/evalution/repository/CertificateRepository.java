package com.example.platformevaluationservice.evalution.repository;


import com.example.platformevaluationservice.evalution.model.Certificate;
import com.example.platformevaluationservice.evalution.model.CertificateStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    List<Certificate> findByApprenantIdOrderByRequestedAtDesc(Long apprenantId);

    Optional<Certificate> findByApprenantIdAndEvaluationId(Long apprenantId, Long evaluationId);

    List<Certificate> findByFormateurIdOrderByRequestedAtDesc(Long formateurId);

    List<Certificate> findByFormateurIdAndStatusOrderByRequestedAtDesc(Long formateurId, CertificateStatus status);

}
