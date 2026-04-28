package org.example.b2bmodule.dto;

public record ProgressRequest(Long assignmentId, Integer progressPercent, Boolean passed) {}

