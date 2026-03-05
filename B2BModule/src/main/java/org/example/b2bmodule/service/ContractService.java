package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Contract;
import org.example.b2bmodule.entity.Mission;
import org.example.b2bmodule.repository.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final MissionRepository missionRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;

    private ContractResponse toResponse(Contract c) {
        return new ContractResponse(c.getId(), c.getContractNumber(), c.getMission() != null ? c.getMission().getId() : null, c.getMission() != null ? c.getMission().getTitle() : null, c.getCandidate().getId(), c.getCompany().getId(), c.getCompany().getName(), c.getTotalAmount(), c.getStartDate(), c.getEndDate(), c.getContractUrl(), c.getStatus().name(), c.getSignedAt());
    }

    public ContractResponse create(ContractRequest req) {
        var mission = missionRepository.findById(req.missionId()).orElseThrow(() -> new RuntimeException("Mission not found"));
        var candidate = candidateRepository.findById(req.candidateId()).orElseThrow(() -> new RuntimeException("Candidate not found"));
        var company = companyRepository.findById(req.companyId()).orElseThrow(() -> new RuntimeException("Company not found"));

        // Mettre la mission en cours
        mission.setStatus(Mission.MissionStatus.IN_PROGRESS);
        missionRepository.save(mission);

        Contract c = Contract.builder()
                .mission(mission).candidate(candidate).company(company)
                .totalAmount(req.totalAmount()).startDate(req.startDate()).endDate(req.endDate()).build();
        return toResponse(contractRepository.save(c));
    }

    public List<ContractResponse> findAll() { return contractRepository.findAll().stream().map(this::toResponse).toList(); }
    public ContractResponse findById(Long id) { return toResponse(contractRepository.findById(id).orElseThrow(() -> new RuntimeException("Contract not found"))); }
    public List<ContractResponse> findByCompany(Long companyId) { return contractRepository.findByCompanyId(companyId).stream().map(this::toResponse).toList(); }
    public List<ContractResponse> findByCandidate(Long candidateId) { return contractRepository.findByCandidateId(candidateId).stream().map(this::toResponse).toList(); }

    public ContractResponse sign(Long id) {
        Contract c = contractRepository.findById(id).orElseThrow(() -> new RuntimeException("Contract not found"));
        c.setStatus(Contract.ContractStatus.SIGNED);
        c.setSignedAt(Instant.now());
        return toResponse(contractRepository.save(c));
    }

    public ContractResponse updateStatus(Long id, String status) {
        Contract c = contractRepository.findById(id).orElseThrow(() -> new RuntimeException("Contract not found"));
        c.setStatus(Contract.ContractStatus.valueOf(status));
        return toResponse(contractRepository.save(c));
    }

    public void delete(Long id) { contractRepository.deleteById(id); }
}

