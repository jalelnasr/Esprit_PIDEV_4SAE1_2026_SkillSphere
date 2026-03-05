package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.CreateCertificate;
import com.example.platformevaluationservice.evalution.dto.UpdateCertificate;
import com.example.platformevaluationservice.evalution.model.Certificate;
import com.example.platformevaluationservice.evalution.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository repository;

    @Override
    public Certificate create(CreateCertificate request) {

        Certificate certificate = new Certificate();
        certificate.setApprenantId(request.getApprenantId());
        certificate.setTitle(request.getTitle());
        certificate.setDescription(request.getDescription());

        return repository.save(certificate);
    }

    @Override
    public List<Certificate> getAll() {
        return repository.findAll();
    }

    @Override
    public Certificate getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
    }

    @Override
    public Certificate update(Long id, UpdateCertificate request) {

        Certificate certificate = getById(id);

        certificate.setTitle(request.getTitle());
        certificate.setDescription(request.getDescription());
        certificate.setActive(request.getActive());

        return repository.save(certificate);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Certificate> getByApprenant(Long apprenantId) {
        return repository.findByApprenantId(apprenantId);
    }
}
