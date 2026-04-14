package com.example.platformevaluationservice.evalution.dto.certificate;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class AttemptHistoryItemDto {
    private Integer score;
    private Boolean passed;
    private Instant submittedAt;
}
