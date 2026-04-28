package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.MissionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MissionApplicationRepository extends JpaRepository<MissionApplication, Long> {
    List<MissionApplication> findByMissionId(Long missionId);
    List<MissionApplication> findByCandidateId(Long candidateId);
    Optional<MissionApplication> findByMissionIdAndCandidateId(Long missionId, Long candidateId);
}

