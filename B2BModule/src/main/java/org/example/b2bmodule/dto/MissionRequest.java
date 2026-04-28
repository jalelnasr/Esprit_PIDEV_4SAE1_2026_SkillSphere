package org.example.b2bmodule.dto;

import java.math.BigDecimal;

public record MissionRequest(Long companyId, String title, String description, Integer durationWeeks, BigDecimal dailyRate, String requiredSkills) {}

