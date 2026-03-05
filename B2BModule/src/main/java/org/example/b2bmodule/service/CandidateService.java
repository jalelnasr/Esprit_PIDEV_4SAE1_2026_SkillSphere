package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Candidate;
import org.example.b2bmodule.repository.CandidateRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;

    private CandidateResponse toResponse(Candidate c) {
        return new CandidateResponse(c.getId(), c.getTitle(), c.getSkills(), c.getExperienceYears(), c.getResumeUrl(), c.getIsLookingForJob());
    }

    public CandidateResponse create(CandidateRequest req) {
        Candidate c = Candidate.builder().id(req.id()).title(req.title()).skills(req.skills()).experienceYears(req.experienceYears()).resumeUrl(req.resumeUrl()).isLookingForJob(req.isLookingForJob() != null ? req.isLookingForJob() : true).build();
        return toResponse(candidateRepository.save(c));
    }

    public List<CandidateResponse> findAll() { return candidateRepository.findAll().stream().map(this::toResponse).toList(); }
    public CandidateResponse findById(Long id) { return toResponse(candidateRepository.findById(id).orElseThrow(() -> new RuntimeException("Candidate not found"))); }
    public List<CandidateResponse> findActive() { return candidateRepository.findByIsLookingForJobTrue().stream().map(this::toResponse).toList(); }
    public List<CandidateResponse> findBySkill(String skill) { return candidateRepository.findBySkill(skill).stream().map(this::toResponse).toList(); }

    public CandidateResponse update(Long id, CandidateRequest req) {
        Candidate c = candidateRepository.findById(id).orElseThrow(() -> new RuntimeException("Candidate not found"));
        if (req.title() != null) c.setTitle(req.title());
        if (req.skills() != null) c.setSkills(req.skills());
        if (req.experienceYears() != null) c.setExperienceYears(req.experienceYears());
        if (req.resumeUrl() != null) c.setResumeUrl(req.resumeUrl());
        if (req.isLookingForJob() != null) c.setIsLookingForJob(req.isLookingForJob());
        return toResponse(candidateRepository.save(c));
    }

    public void delete(Long id) { candidateRepository.deleteById(id); }
}

