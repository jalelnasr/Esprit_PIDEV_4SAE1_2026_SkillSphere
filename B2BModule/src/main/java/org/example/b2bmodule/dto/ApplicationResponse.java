package org.example.b2bmodule.dto;

import java.time.Instant;

public record ApplicationResponse(Long id, Long jobOfferId, String jobOfferTitle, Long candidateId, String candidateTitle, Double matchScore, String status, Instant appliedAt) {}

