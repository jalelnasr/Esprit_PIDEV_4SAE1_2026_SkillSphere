package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Candidate;
import org.example.b2bmodule.entity.MissionApplication;
import org.example.b2bmodule.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class MissionApplicationService {

    private final MissionApplicationRepository missionAppRepository;
    private final MissionRepository missionRepository;
    private final CandidateRepository candidateRepository;
    private final CandidateMatchingService matchingService;

    private MissionApplicationResponse toResponse(MissionApplication ma) {
        // Calculer le score de matching AI amélioré
        int matchingScore = matchingService.calculateMatchingScore(ma, ma.getMission(), ma.getCandidate());
        String recommendation = matchingService.getMatchingRecommendation(matchingScore, ma.getMission(), ma.getCandidate());
        
        return new MissionApplicationResponse(
            ma.getId(), 
            ma.getMission().getId(), 
            ma.getMission().getTitle(), 
            ma.getCandidate().getId(), 
            ma.getCandidate().getTitle(), 
            ma.getProposedRate(), 
            ma.getStatus().name(), 
            ma.getAppliedAt(),
            matchingScore,
            recommendation
        );
    }

    public MissionApplicationResponse apply(MissionApplicationRequest req) {
        missionAppRepository.findByMissionIdAndCandidateId(req.missionId(), req.candidateId())
                .ifPresent(a -> { throw new RuntimeException("Already applied"); });
        var mission = missionRepository.findById(req.missionId()).orElseThrow(() -> new RuntimeException("Mission not found"));
        
        // Ensure candidate exists - create if not found
        var candidate = candidateRepository.findById(req.candidateId())
                .orElseGet(() -> {
                    // Auto-create candidate with basic info
                    Candidate newCandidate = Candidate.builder()
                            .id(req.candidateId())
                            .title("Freelancer") // Default title
                            .skills("") // Empty skills initially
                            .experienceYears(0) // Default experience
                            .resumeUrl(null) // Allow null resume URL
                            .isLookingForJob(true)
                            .build();
                    return candidateRepository.save(newCandidate);
                });
        
        MissionApplication ma = MissionApplication.builder().mission(mission).candidate(candidate).proposedRate(req.proposedRate()).build();
        return toResponse(missionAppRepository.save(ma));
    }

    public List<MissionApplicationResponse> findByMission(Long missionId) { return missionAppRepository.findByMissionId(missionId).stream().map(this::toResponse).toList(); }
    public List<MissionApplicationResponse> findByCandidate(Long candidateId) { return missionAppRepository.findByCandidateId(candidateId).stream().map(this::toResponse).toList(); }

    public MissionApplicationResponse findById(Long id) {
        MissionApplication ma = missionAppRepository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        return toResponse(ma);
    }

    public MissionApplicationResponse updateStatus(Long id, String status) {
        MissionApplication ma = missionAppRepository.findById(id).orElseThrow(() -> new RuntimeException("MissionApplication not found"));
        ma.setStatus(MissionApplication.MissionAppStatus.valueOf(status));
        return toResponse(missionAppRepository.save(ma));
    }

    public void delete(Long id) { missionAppRepository.deleteById(id); }

    public Map<String, Object> getDetailedMatchingAnalysis(Long applicationId) {
        MissionApplication ma = missionAppRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        int score = matchingService.calculateMatchingScore(ma, ma.getMission(), ma.getCandidate());
        String recommendation = matchingService.getMatchingRecommendation(score, ma.getMission(), ma.getCandidate());
        String detailedAnalysis = matchingService.getDetailedAnalysis(ma, ma.getMission(), ma.getCandidate());
        String badgeClass = matchingService.getScoreBadgeClass(score);
        
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("score", score);
        analysis.put("recommendation", recommendation);
        analysis.put("detailedAnalysis", detailedAnalysis);
        analysis.put("badgeClass", badgeClass);
        analysis.put("candidateName", ma.getCandidate().getTitle());
        analysis.put("missionTitle", ma.getMission().getTitle());
        
        return analysis;
    }
}

