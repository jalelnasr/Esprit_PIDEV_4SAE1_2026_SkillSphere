package org.example.b2bmodule.dto;

import java.time.Instant;

public record ProgressResponse(Long id, Long assignmentId, Integer progressPercent, Instant startedAt, Instant completedAt, Boolean passed, Instant updatedAt) {}

