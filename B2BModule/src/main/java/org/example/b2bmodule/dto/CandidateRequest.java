package org.example.b2bmodule.dto;

public record CandidateRequest(Long id, String title, String skills, Integer experienceYears, String resumeUrl, Boolean isLookingForJob) {}

