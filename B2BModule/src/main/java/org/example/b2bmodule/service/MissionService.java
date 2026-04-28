package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Mission;
import org.example.b2bmodule.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository missionRepository;
    private final CompanyRepository companyRepository;

    private MissionResponse toResponse(Mission m) {
        int appCount = m.getMissionApplications() != null ? m.getMissionApplications().size() : 0;
        return new MissionResponse(m.getId(), m.getCompany().getId(), m.getCompany().getName(), m.getTitle(), m.getDescription(), m.getDurationWeeks(), m.getDailyRate(), m.getRequiredSkills(), m.getStatus().name(), appCount);
    }

    public MissionResponse create(MissionRequest req) {
        var company = companyRepository.findById(req.companyId()).orElseThrow(() -> new RuntimeException("Company not found"));
        Mission m = Mission.builder().company(company).title(req.title()).description(req.description()).durationWeeks(req.durationWeeks()).dailyRate(req.dailyRate()).requiredSkills(req.requiredSkills()).build();
        return toResponse(missionRepository.save(m));
    }

    public List<MissionResponse> findAll() { 
        return missionRepository.findAllWithRelations().stream().map(this::toResponse).toList(); 
    }
    
    public MissionResponse findById(Long id) { 
        return toResponse(missionRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new RuntimeException("Mission not found"))); 
    }
    
    public List<MissionResponse> findByCompany(Long companyId) { 
        return missionRepository.findByCompanyIdWithRelations(companyId).stream().map(this::toResponse).toList(); 
    }
    
    public List<MissionResponse> findOpen() { 
        return missionRepository.findByStatusWithRelations(Mission.MissionStatus.OPEN).stream().map(this::toResponse).toList(); 
    }

    public MissionResponse update(Long id, MissionRequest req) {
        Mission m = missionRepository.findById(id).orElseThrow(() -> new RuntimeException("Mission not found"));
        if (req.title() != null) m.setTitle(req.title());
        if (req.description() != null) m.setDescription(req.description());
        if (req.durationWeeks() != null) m.setDurationWeeks(req.durationWeeks());
        if (req.dailyRate() != null) m.setDailyRate(req.dailyRate());
        if (req.requiredSkills() != null) m.setRequiredSkills(req.requiredSkills());
        return toResponse(missionRepository.save(m));
    }

    public MissionResponse updateStatus(Long id, String status) {
        Mission m = missionRepository.findById(id).orElseThrow(() -> new RuntimeException("Mission not found"));
        m.setStatus(Mission.MissionStatus.valueOf(status));
        return toResponse(missionRepository.save(m));
    }

    public void delete(Long id) { missionRepository.deleteById(id); }
}

