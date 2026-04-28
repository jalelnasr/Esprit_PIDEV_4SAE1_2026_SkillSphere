package org.example.b2bmodule.dto;

import java.math.BigDecimal;

public record MissionResponse(Long id, Long companyId, String companyName, String title, String description, Integer durationWeeks, BigDecimal dailyRate, String requiredSkills, String status, int applicationCount) {}

