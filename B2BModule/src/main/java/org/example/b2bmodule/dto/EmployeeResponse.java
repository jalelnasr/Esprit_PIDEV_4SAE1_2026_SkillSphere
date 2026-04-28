package org.example.b2bmodule.dto;

import java.time.LocalDate;

public record EmployeeResponse(Long id, Long companyId, String companyName, String department, String position, Long managerId, LocalDate hireDate) {}

