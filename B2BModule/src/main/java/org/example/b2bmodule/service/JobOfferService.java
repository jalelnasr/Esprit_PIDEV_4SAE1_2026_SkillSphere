package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.JobOffer;
import org.example.b2bmodule.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;
    private final CompanyRepository companyRepository;

    private JobOfferResponse toResponse(JobOffer j) {
        int appCount = j.getApplications() != null ? j.getApplications().size() : 0;
        return new JobOfferResponse(j.getId(), j.getCompany().getId(), j.getCompany().getName(), j.getTitle(), j.getDescription(), j.getContractType(), j.getLocation(), j.getRequiredSkills(), j.getStatus().name(), j.getPostedAt(), appCount);
    }

    public JobOfferResponse create(JobOfferRequest req) {
        var company = companyRepository.findById(req.companyId()).orElseThrow(() -> new RuntimeException("Company not found"));
        JobOffer j = JobOffer.builder().company(company).title(req.title()).description(req.description()).contractType(req.contractType()).location(req.location()).requiredSkills(req.requiredSkills()).build();
        return toResponse(jobOfferRepository.save(j));
    }

    public List<JobOfferResponse> findAll() { return jobOfferRepository.findAll().stream().map(this::toResponse).toList(); }
    public JobOfferResponse findById(Long id) { return toResponse(jobOfferRepository.findById(id).orElseThrow(() -> new RuntimeException("JobOffer not found"))); }
    public List<JobOfferResponse> findByCompany(Long companyId) { return jobOfferRepository.findByCompanyId(companyId).stream().map(this::toResponse).toList(); }
    public List<JobOfferResponse> findOpen() { return jobOfferRepository.findByStatus(JobOffer.JobOfferStatus.OPEN).stream().map(this::toResponse).toList(); }
    public List<JobOfferResponse> searchBySkill(String skill) { return jobOfferRepository.findOpenBySkill(skill).stream().map(this::toResponse).toList(); }

    public JobOfferResponse update(Long id, JobOfferRequest req) {
        JobOffer j = jobOfferRepository.findById(id).orElseThrow(() -> new RuntimeException("JobOffer not found"));
        if (req.title() != null) j.setTitle(req.title());
        if (req.description() != null) j.setDescription(req.description());
        if (req.contractType() != null) j.setContractType(req.contractType());
        if (req.location() != null) j.setLocation(req.location());
        if (req.requiredSkills() != null) j.setRequiredSkills(req.requiredSkills());
        return toResponse(jobOfferRepository.save(j));
    }

    public JobOfferResponse updateStatus(Long id, String status) {
        JobOffer j = jobOfferRepository.findById(id).orElseThrow(() -> new RuntimeException("JobOffer not found"));
        j.setStatus(JobOffer.JobOfferStatus.valueOf(status));
        return toResponse(jobOfferRepository.save(j));
    }

    public void delete(Long id) { jobOfferRepository.deleteById(id); }
}

