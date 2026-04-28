package org.example.b2bmodule.dto;

import java.math.BigDecimal;

public record MissionApplicationRequest(Long missionId, Long candidateId, BigDecimal proposedRate) {}

