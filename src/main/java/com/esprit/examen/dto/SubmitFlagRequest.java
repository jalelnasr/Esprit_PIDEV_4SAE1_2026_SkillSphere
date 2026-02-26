package com.esprit.examen.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitFlagRequest(
    @NotBlank(message = "Submitted flag is required")
    String submittedFlag
) {}
