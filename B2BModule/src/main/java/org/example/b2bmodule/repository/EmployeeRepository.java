package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByCompanyId(Long companyId);
    List<Employee> findByManagerId(Long managerId);
    @Query("SELECT COUNT(e) FROM Employee e WHERE e.company.id = :companyId")
    long countByCompanyId(Long companyId);
}

