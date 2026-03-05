package org.example.b2bmodule.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

public record ContractResponse(Long id, String contractNumber, Long missionId, String missionTitle, Long candidateId, Long companyId, String companyName, BigDecimal totalAmount, LocalDate startDate, LocalDate endDate, String contractUrl, String status, Instant signedAt) {}

