package org.example.b2bmodule.dto;

import java.math.BigDecimal;

public record PackRequest(String name, String description, Integer formationsCount, BigDecimal price, Boolean isActive) {}

