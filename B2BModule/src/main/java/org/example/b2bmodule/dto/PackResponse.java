package org.example.b2bmodule.dto;

import java.math.BigDecimal;

public record PackResponse(Long id, String name, String description, Integer formationsCount, BigDecimal price, Boolean isActive) {}

