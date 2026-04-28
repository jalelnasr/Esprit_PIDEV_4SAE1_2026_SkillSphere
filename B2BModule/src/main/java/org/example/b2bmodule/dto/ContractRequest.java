package org.example.b2bmodule.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContractRequest(Long missionId, Long candidateId, Long companyId, BigDecimal totalAmount, LocalDate startDate, LocalDate endDate) {}

