package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByMissionId(Long missionId);
    Optional<Contract> findByMissionIdAndCandidateId(Long missionId, Long candidateId);
    List<Contract> findByCandidateId(Long candidateId);
    List<Contract> findByCompanyId(Long companyId);
    Optional<Contract> findByContractNumber(String contractNumber);
    List<Contract> findByStatus(Contract.ContractStatus status);
}

