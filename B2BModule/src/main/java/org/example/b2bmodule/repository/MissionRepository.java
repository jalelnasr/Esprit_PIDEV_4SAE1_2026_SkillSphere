package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByCompanyId(Long companyId);
    List<Mission> findByStatus(Mission.MissionStatus status);
}

