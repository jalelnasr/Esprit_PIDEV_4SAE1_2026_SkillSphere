package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.CreateCertificate;
import com.example.platformevaluationservice.evalution.dto.UpdateCertificate;
import com.example.platformevaluationservice.evalution.model.Certificate;

import java.util.List;

public interface CertificateService {

    Certificate create(CreateCertificate request);

    List<Certificate> getAll();

    Certificate getById(Long id);

    Certificate update(Long id, UpdateCertificate request);

    void delete(Long id);

    List<Certificate> getByApprenant(Long apprenantId);
}