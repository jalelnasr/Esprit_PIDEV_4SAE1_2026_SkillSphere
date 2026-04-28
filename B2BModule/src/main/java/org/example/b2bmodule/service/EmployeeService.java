package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Employee;
import org.example.b2bmodule.repository.CompanyRepository;
import org.example.b2bmodule.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;

    private EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(e.getId(), e.getCompany().getId(), e.getCompany().getName(), e.getDepartment(), e.getPosition(), e.getManager() != null ? e.getManager().getId() : null, e.getHireDate());
    }

    public EmployeeResponse create(EmployeeRequest req) {
        var company = companyRepository.findById(req.companyId()).orElseThrow(() -> new RuntimeException("Company not found"));
        Employee e = Employee.builder().id(req.id()).company(company).department(req.department()).position(req.position()).build();
        if (req.managerId() != null) {
            var manager = employeeRepository.findById(req.managerId()).orElseThrow(() -> new RuntimeException("Manager not found"));
            e.setManager(manager);
        }
        return toResponse(employeeRepository.save(e));
    }

    public List<EmployeeResponse> findAll() {
        return employeeRepository.findAll().stream().map(this::toResponse).toList();
    }

    public EmployeeResponse findById(Long id) {
        return toResponse(employeeRepository.findById(id).orElseThrow(() -> new RuntimeException("Employee not found")));
    }

    public List<EmployeeResponse> findByCompany(Long companyId) {
        return employeeRepository.findByCompanyId(companyId).stream().map(this::toResponse).toList();
    }

    public EmployeeResponse update(Long id, EmployeeRequest req) {
        Employee e = employeeRepository.findById(id).orElseThrow(() -> new RuntimeException("Employee not found"));
        if (req.department() != null) e.setDepartment(req.department());
        if (req.position() != null) e.setPosition(req.position());
        if (req.managerId() != null) {
            var manager = employeeRepository.findById(req.managerId()).orElseThrow(() -> new RuntimeException("Manager not found"));
            e.setManager(manager);
        }
        return toResponse(employeeRepository.save(e));
    }

    public void delete(Long id) {
        employeeRepository.deleteById(id);
    }

    public List<EmployeeResponse> findByManager(Long managerId) {
        return employeeRepository.findByManagerId(managerId).stream().map(this::toResponse).toList();
    }
}

