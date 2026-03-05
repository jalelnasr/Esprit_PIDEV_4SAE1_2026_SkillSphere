package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.MissionApplication;
import org.example.b2bmodule.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MissionApplicationService {

    private final MissionApplicationRepository missionAppRepository;
    private final MissionRepository missionRepository;
    private final CandidateRepository candidateRepository;

    private MissionApplicationResponse toResponse(MissionApplication ma) {
        return new MissionApplicationResponse(ma.getId(), ma.getMission().getId(), ma.getMission().getTitle(), ma.getCandidate().getId(), ma.getCandidate().getTitle(), ma.getProposedRate(), ma.getStatus().name(), ma.getAppliedAt());
    }

    public MissionApplicationResponse apply(MissionApplicationRequest req) {
        missionAppRepository.findByMissionIdAndCandidateId(req.missionId(), req.candidateId())
                .ifPresent(a -> { throw new RuntimeException("Already applied"); });
        var mission = missionRepository.findById(req.missionId()).orElseThrow(() -> new RuntimeException("Mission not found"));
        var candidate = candidateRepository.findById(req.candidateId()).orElseThrow(() -> new RuntimeException("Candidate not found"));
        MissionApplication ma = MissionApplication.builder().mission(mission).candidate(candidate).proposedRate(req.proposedRate()).build();
        return toResponse(missionAppRepository.save(ma));
    }

    public List<MissionApplicationResponse> findByMission(Long missionId) { return missionAppRepository.findByMissionId(missionId).stream().map(this::toResponse).toList(); }
    public List<MissionApplicationResponse> findByCandidate(Long candidateId) { return missionAppRepository.findByCandidateId(candidateId).stream().map(this::toResponse).toList(); }

    public MissionApplicationResponse updateStatus(Long id, String status) {
        MissionApplication ma = missionAppRepository.findById(id).orElseThrow(() -> new RuntimeException("MissionApplication not found"));
        ma.setStatus(MissionApplication.MissionAppStatus.valueOf(status));
        return toResponse(missionAppRepository.save(ma));
    }

    public void delete(Long id) { missionAppRepository.deleteById(id); }
}

