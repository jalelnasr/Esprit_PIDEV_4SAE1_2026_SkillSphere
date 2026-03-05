package org.example.b2bmodule.dto;

import java.time.Instant;

public record CompanyResponse(Long id, String name, String email, String siret, String sector, String address, String phone, Integer creditsRemaining, Long createdBy, Instant createdAt, long employeeCount) {}

