package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Progress;
import org.example.b2bmodule.entity.Assignment;
import org.example.b2bmodule.repository.ProgressRepository;
import org.example.b2bmodule.repository.AssignmentRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final AssignmentRepository assignmentRepository;

    private ProgressResponse toResponse(Progress p) {
        return new ProgressResponse(p.getId(), p.getAssignment().getId(), p.getProgressPercent(), p.getStartedAt(), p.getCompletedAt(), p.getPassed(), p.getUpdatedAt());
    }

    public ProgressResponse findByAssignment(Long assignmentId) {
        return toResponse(progressRepository.findByAssignmentId(assignmentId).orElseThrow(() -> new RuntimeException("Progress not found")));
    }

    public ProgressResponse updateProgress(Long assignmentId, ProgressRequest req) {
        Progress p = progressRepository.findByAssignmentId(assignmentId).orElseThrow(() -> new RuntimeException("Progress not found"));
        if (req.progressPercent() != null) {
            p.setProgressPercent(req.progressPercent());
            if (p.getStartedAt() == null && req.progressPercent() > 0) p.setStartedAt(Instant.now());
            if (req.progressPercent() >= 100) {
                p.setCompletedAt(Instant.now());
                Assignment a = p.getAssignment();
                a.setStatus(Assignment.AssignmentStatus.COMPLETED);
                assignmentRepository.save(a);
            } else if (req.progressPercent() > 0) {
                Assignment a = p.getAssignment();
                if (a.getStatus() == Assignment.AssignmentStatus.ASSIGNED) {
                    a.setStatus(Assignment.AssignmentStatus.IN_PROGRESS);
                    assignmentRepository.save(a);
                }
            }
        }
        if (req.passed() != null) p.setPassed(req.passed());
        return toResponse(progressRepository.save(p));
    }

    public Double averageByCompany(Long companyId) {
        Double avg = progressRepository.averageProgressByCompanyId(companyId);
        return avg != null ? avg : 0.0;
    }
}

