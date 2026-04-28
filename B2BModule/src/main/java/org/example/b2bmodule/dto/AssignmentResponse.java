package org.example.b2bmodule.dto;

import java.time.LocalDate;

public record AssignmentResponse(Long id, Long companyId, Long employeeId, Long packId, String packName, String courseName, LocalDate deadline, String status, Integer progressPercent) {}

