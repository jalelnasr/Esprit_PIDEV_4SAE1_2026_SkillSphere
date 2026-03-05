package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Assignment;
import org.example.b2bmodule.entity.Progress;
import org.example.b2bmodule.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;
    private final PackRepository packRepository;
    private final ProgressRepository progressRepository;

    private AssignmentResponse toResponse(Assignment a) {
        Integer prog = a.getProgress() != null ? a.getProgress().getProgressPercent() : 0;
        return new AssignmentResponse(a.getId(), a.getCompany().getId(), a.getEmployee().getId(), a.getPack().getId(), a.getPack().getName(), a.getCourseName(), a.getDeadline(), a.getStatus().name(), prog);
    }

    public AssignmentResponse create(AssignmentRequest req) {
        var company = companyRepository.findById(req.companyId()).orElseThrow(() -> new RuntimeException("Company not found"));
        var employee = employeeRepository.findById(req.employeeId()).orElseThrow(() -> new RuntimeException("Employee not found"));
        var pack = packRepository.findById(req.packId()).orElseThrow(() -> new RuntimeException("Pack not found"));
        Assignment a = Assignment.builder().company(company).employee(employee).pack(pack).courseName(req.courseName()).deadline(req.deadline()).build();
        Assignment saved = assignmentRepository.save(a);
        // Auto-create progress
        Progress p = Progress.builder().assignment(saved).build();
        progressRepository.save(p);
        saved.setProgress(p);
        return toResponse(saved);
    }

    public List<AssignmentResponse> findAll() { return assignmentRepository.findAll().stream().map(this::toResponse).toList(); }
    public AssignmentResponse findById(Long id) { return toResponse(assignmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Assignment not found"))); }
    public List<AssignmentResponse> findByCompany(Long companyId) { return assignmentRepository.findByCompanyId(companyId).stream().map(this::toResponse).toList(); }
    public List<AssignmentResponse> findByEmployee(Long employeeId) { return assignmentRepository.findByEmployeeId(employeeId).stream().map(this::toResponse).toList(); }

    public AssignmentResponse updateStatus(Long id, String status) {
        Assignment a = assignmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Assignment not found"));
        a.setStatus(Assignment.AssignmentStatus.valueOf(status));
        return toResponse(assignmentRepository.save(a));
    }

    public void delete(Long id) { assignmentRepository.deleteById(id); }
}

