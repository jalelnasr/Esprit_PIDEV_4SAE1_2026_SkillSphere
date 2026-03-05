package org.example.b2bmodule.dto;

public record JobOfferRequest(Long companyId, String title, String description, String contractType, String location, String requiredSkills) {}

