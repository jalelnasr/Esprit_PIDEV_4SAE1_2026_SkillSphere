package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCompanyId(Long companyId);
    List<Assignment> findByEmployeeId(Long employeeId);
    List<Assignment> findByPackId(Long packId);
    List<Assignment> findByStatus(Assignment.AssignmentStatus status);
    List<Assignment> findByDeadlineBefore(LocalDate date);
    List<Assignment> findByCompanyIdAndStatus(Long companyId, Assignment.AssignmentStatus status);
}

