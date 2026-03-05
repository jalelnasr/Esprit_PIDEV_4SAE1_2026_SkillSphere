package org.example.b2bmodule.dto;

public record EmployeeRequest(Long id, Long companyId, String department, String position, Long managerId) {}

