package com.example.platformevaluationservice.evalution.dto.certificate;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CertificateRequestDetailDto extends CertificateResponseDto {
    private List<AttemptHistoryItemDto> attemptHistory;
}
