package org.example.b2bmodule.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MissionApplicationResponse(Long id, Long missionId, String missionTitle, Long candidateId, String candidateTitle, BigDecimal proposedRate, String status, Instant appliedAt) {}

