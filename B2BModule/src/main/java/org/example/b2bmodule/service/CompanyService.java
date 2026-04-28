package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Company;
import org.example.b2bmodule.repository.CompanyRepository;
import org.example.b2bmodule.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;

    private CompanyResponse toResponse(Company c) {
        long empCount = employeeRepository.countByCompanyId(c.getId());
        return new CompanyResponse(c.getId(), c.getName(), c.getEmail(), c.getSiret(), c.getSector(), c.getAddress(), c.getPhone(), c.getCreditsRemaining(), c.getCreatedBy(), c.getCreatedAt(), empCount);
    }

    public CompanyResponse create(CompanyRequest req) {
        Company c = Company.builder()
                .name(req.name()).email(req.email()).siret(req.siret())
                .sector(req.sector()).address(req.address()).phone(req.phone())
                .createdBy(req.createdBy()).build();
        return toResponse(companyRepository.save(c));
    }

    public List<CompanyResponse> findAll() {
        return companyRepository.findAll().stream().map(this::toResponse).toList();
    }

    public CompanyResponse findById(Long id) {
        return toResponse(companyRepository.findById(id).orElseThrow(() -> new RuntimeException("Company not found")));
    }

    public CompanyResponse update(Long id, CompanyRequest req) {
        Company c = companyRepository.findById(id).orElseThrow(() -> new RuntimeException("Company not found"));
        if (req.name() != null) c.setName(req.name());
        if (req.email() != null) c.setEmail(req.email());
        if (req.siret() != null) c.setSiret(req.siret());
        if (req.sector() != null) c.setSector(req.sector());
        if (req.address() != null) c.setAddress(req.address());
        if (req.phone() != null) c.setPhone(req.phone());
        return toResponse(companyRepository.save(c));
    }

    public void delete(Long id) {
        companyRepository.deleteById(id);
    }

    public List<CompanyResponse> findBySector(String sector) {
        return companyRepository.findBySectorContainingIgnoreCase(sector).stream().map(this::toResponse).toList();
    }
}

