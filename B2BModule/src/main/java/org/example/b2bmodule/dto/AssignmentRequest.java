package org.example.b2bmodule.dto;

import java.time.LocalDate;

public record AssignmentRequest(Long companyId, Long employeeId, Long packId, String courseName, LocalDate deadline) {}

