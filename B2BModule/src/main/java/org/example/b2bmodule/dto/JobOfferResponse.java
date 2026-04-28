package org.example.b2bmodule.dto;

import java.time.Instant;

public record JobOfferResponse(Long id, Long companyId, String companyName, String title, String description, String contractType, String location, String requiredSkills, String status, Instant postedAt, int applicationCount) {}

