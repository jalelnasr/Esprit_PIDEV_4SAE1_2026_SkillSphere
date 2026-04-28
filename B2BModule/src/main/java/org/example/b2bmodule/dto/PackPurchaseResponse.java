package org.example.b2bmodule.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PackPurchaseResponse(Long id, Long companyId, String companyName, Long packId, String packName, BigDecimal totalAmount, Instant purchaseDate) {}

