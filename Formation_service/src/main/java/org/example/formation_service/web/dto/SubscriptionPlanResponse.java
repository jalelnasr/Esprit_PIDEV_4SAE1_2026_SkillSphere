package org.example.formation_service.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.formation_service.domain.enums.AccessLevel;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanResponse {
    private Long id;
    private String name;
    private String slug;
    private BigDecimal priceMonthly;
    private String currency;
    private Integer monthlyEnrollmentLimit;
    private AccessLevel accessLevel;
    private String features;
    private Boolean isActive;
}
