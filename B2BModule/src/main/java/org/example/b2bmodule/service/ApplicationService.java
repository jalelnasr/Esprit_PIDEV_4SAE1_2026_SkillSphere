package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Application;
import org.example.b2bmodule.entity.Candidate;
import org.example.b2bmodule.entity.JobOffer;
import org.example.b2bmodule.repository.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobOfferRepository jobOfferRepository;
    private final CandidateRepository candidateRepository;

    private ApplicationResponse toResponse(Application a) {
        Long jobOfferId = a.getJobOffer() != null ? a.getJobOffer().getId() : null;
        String jobOfferTitle = a.getJobOffer() != null ? a.getJobOffer().getTitle() : null;
        Long candidateId = a.getCandidate() != null ? a.getCandidate().getId() : null;
        String candidateTitle = a.getCandidate() != null ? a.getCandidate().getTitle() : null;
        return new ApplicationResponse(a.getId(), jobOfferId, jobOfferTitle, candidateId, candidateTitle, a.getMatchScore(), a.getStatus().name(), a.getAppliedAt());
    }

    // ✅ Algorithme de matching intelligent
    private double calculateMatchScore(Candidate candidate, JobOffer jobOffer) {
        if (candidate.getSkills() == null || jobOffer.getRequiredSkills() == null) return 0.0;

        Set<String> candidateSkills = Arrays.stream(candidate.getSkills().toLowerCase().split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toSet());
        Set<String> requiredSkills = Arrays.stream(jobOffer.getRequiredSkills().toLowerCase().split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toSet());

        if (requiredSkills.isEmpty()) return 0.0;

        Set<String> intersection = new HashSet<>(candidateSkills);
        intersection.retainAll(requiredSkills);

        return (double) intersection.size() / requiredSkills.size() * 100.0;
    }

    public ApplicationResponse apply(ApplicationRequest req) {
        // Vérifier doublon
        applicationRepository.findByJobOfferIdAndCandidateId(req.jobOfferId(), req.candidateId())
                .ifPresent(a -> { throw new RuntimeException("Already applied"); });

        var jobOffer = jobOfferRepository.findById(req.jobOfferId()).orElseThrow(() -> new RuntimeException("JobOffer not found"));
        var candidate = candidateRepository.findById(req.candidateId()).orElseThrow(() -> new RuntimeException("Candidate not found"));

        double score = calculateMatchScore(candidate, jobOffer);

        Application app = Application.builder()
                .jobOffer(jobOffer).candidate(candidate).matchScore(score).build();
        return toResponse(applicationRepository.save(app));
    }

    public List<ApplicationResponse> findAll() { return applicationRepository.findAll().stream().map(this::toResponse).toList(); }
    public ApplicationResponse findById(Long id) { return toResponse(applicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"))); }
    public List<ApplicationResponse> findByJobOffer(Long jobOfferId) { return applicationRepository.findByJobOfferId(jobOfferId).stream().map(this::toResponse).toList(); }
    public List<ApplicationResponse> findByCandidate(Long candidateId) { return applicationRepository.findByCandidateId(candidateId).stream().map(this::toResponse).toList(); }
    public List<ApplicationResponse> findTopMatches(Long jobOfferId) { return applicationRepository.findTopByJobOfferOrderByMatchScore(jobOfferId).stream().map(this::toResponse).toList(); }

    public ApplicationResponse updateStatus(Long id, String status) {
        Application a = applicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        a.setStatus(Application.ApplicationStatus.valueOf(status));
        return toResponse(applicationRepository.save(a));
    }

    public void delete(Long id) { applicationRepository.deleteById(id); }
}

